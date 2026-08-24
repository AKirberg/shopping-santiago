import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === "production";
const validMallIds = new Set(
  JSON.parse(readFileSync(path.join(__dirname, "src/data/malls.json"), "utf8")).map((mall) => mall.id),
);
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 4;
const MAX_REPORTS_PER_WINDOW = 12;
const REPORT_HIDE_THRESHOLD = 3;
const REPORT_REASONS = new Set(["offensive", "misleading", "personal_data"]);

function databaseUnavailable(res) {
  return res.status(503).json({ error: "reviews_unavailable" });
}

function normalizeComment(comment) {
  if (typeof comment !== "string") return null;
  const normalized = comment.replace(/\u0000/g, "").trim();
  return normalized || null;
}

function requestIp(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function submissionHash(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(requestIp(req)).digest("hex");
}

function reviewDeleteToken(reviewId, submissionHashValue) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(`review-delete:${reviewId}:${submissionHashValue}`)
    .digest("base64url");
}

function deleteTokenMatches(suppliedToken, expectedToken) {
  if (typeof suppliedToken !== "string" || !expectedToken) return false;
  const supplied = Buffer.from(suppliedToken);
  const expected = Buffer.from(expectedToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function reviewResponse(row) {
  return {
    id: String(row.id),
    rating: Number(row.rating),
    comment: row.comment,
    createdAt: row.created_at,
  };
}

async function getSummary(mallId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count, COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average
     FROM mall_reviews AS reviews
     WHERE reviews.mall_id = $1
       AND (SELECT COUNT(*) FROM mall_review_reports
            WHERE review_id = reviews.id) < $2`,
    [mallId, REPORT_HIDE_THRESHOLD],
  );
  return { count: rows[0].count, average: Number(rows[0].average) };
}

async function getSummaryWithClient(client, mallId) {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS count, COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average
     FROM mall_reviews AS reviews
     WHERE reviews.mall_id = $1
       AND (SELECT COUNT(*) FROM mall_review_reports
            WHERE review_id = reviews.id) < $2`,
    [mallId, REPORT_HIDE_THRESHOLD],
  );
  return { count: rows[0].count, average: Number(rows[0].average) };
}

function configureReviewsApi(app) {
  app.get("/api/reviews", async (req, res) => {
    if (!pool) return databaseUnavailable(res);
    const requestedIds = String(req.query.mallIds || "")
      .split(",")
      .filter((id) => validMallIds.has(id))
      .slice(0, 50);

    if (!requestedIds.length) return res.json({ summaries: {} });

    try {
      const { rows } = await pool.query(
        `SELECT mall_id, COUNT(*)::int AS count, ROUND(AVG(rating)::numeric, 1) AS average
         FROM mall_reviews AS reviews
         WHERE reviews.mall_id = ANY($1::text[])
           AND (SELECT COUNT(*) FROM mall_review_reports
                WHERE review_id = reviews.id) < $2
         GROUP BY reviews.mall_id`,
        [requestedIds, REPORT_HIDE_THRESHOLD],
      );
      const summaries = Object.fromEntries(requestedIds.map((id) => [id, { count: 0, average: 0 }]));
      rows.forEach((row) => {
        summaries[row.mall_id] = { count: row.count, average: Number(row.average) };
      });
      return res.json({ summaries });
    } catch (error) {
      console.error("Could not load review summaries", error);
      return res.status(500).json({ error: "reviews_failed" });
    }
  });

  app.get("/api/reviews/:mallId", async (req, res) => {
    const { mallId } = req.params;
    if (!validMallIds.has(mallId)) return res.status(404).json({ error: "mall_not_found" });
    if (!pool) return databaseUnavailable(res);

    try {
      const [summary, reviews] = await Promise.all([
        getSummary(mallId),
        pool.query(
          `SELECT id, rating, comment, created_at
           FROM mall_reviews AS reviews
           WHERE reviews.mall_id = $1
             AND (SELECT COUNT(*) FROM mall_review_reports
                  WHERE review_id = reviews.id) < $2
           ORDER BY created_at DESC, id DESC LIMIT 20`,
           [mallId, REPORT_HIDE_THRESHOLD],
        ),
      ]);
      return res.json({ summary, reviews: reviews.rows.map(reviewResponse) });
    } catch (error) {
      console.error("Could not load reviews", error);
      return res.status(500).json({ error: "reviews_failed" });
    }
  });

  app.post("/api/reviews/:mallId/:reviewId/report", async (req, res) => {
    const { mallId, reviewId: rawReviewId } = req.params;
    const reason = typeof req.body?.reason === "string" ? req.body.reason : "";
    if (!validMallIds.has(mallId)) return res.status(404).json({ error: "mall_not_found" });
    if (!/^\d+$/.test(rawReviewId) || !REPORT_REASONS.has(reason)) {
      return res.status(400).json({ error: "invalid_report" });
    }
    if (!pool) return databaseUnavailable(res);

    const fingerprint = submissionHash(req);
    if (!fingerprint) return databaseUnavailable(res);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`report:${fingerprint}`]);
      const { rows: reviewRows } = await client.query(
        `SELECT reviews.id,
                EXISTS (
                  SELECT 1 FROM mall_review_reports AS own_report
                  WHERE own_report.review_id = reviews.id AND own_report.reporter_hash = $3
                ) AS already_reported,
                (SELECT COUNT(*)::int FROM mall_review_reports AS all_reports
                 WHERE all_reports.review_id = reviews.id) AS report_count
         FROM mall_reviews AS reviews
         WHERE reviews.id = $1 AND reviews.mall_id = $2`,
        [rawReviewId, mallId, fingerprint],
      );
      if (!reviewRows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "review_not_found" });
      }

      const review = reviewRows[0];
      if (review.already_reported) {
        await client.query("ROLLBACK");
        return res.json({
          reported: true,
          alreadyReported: true,
          hidden: Number(review.report_count) >= REPORT_HIDE_THRESHOLD,
        });
      }

      const { rows: recent } = await client.query(
        `SELECT COUNT(*)::int AS count FROM mall_review_reports
         WHERE reporter_hash = $1 AND created_at > NOW() - INTERVAL '15 minutes'`,
        [fingerprint],
      );
      if (recent[0].count >= MAX_REPORTS_PER_WINDOW) {
        await client.query("ROLLBACK");
        return res.status(429).json({ error: "report_rate_limited" });
      }

      await client.query(
        `INSERT INTO mall_review_reports (review_id, reason, reporter_hash)
         VALUES ($1, $2, $3)`,
        [rawReviewId, reason, fingerprint],
      );
      const { rows: countRows } = await client.query(
        `SELECT COUNT(*)::int AS count FROM mall_review_reports WHERE review_id = $1`,
        [rawReviewId],
      );
      const reportCount = countRows[0].count;
      const hidden = reportCount >= REPORT_HIDE_THRESHOLD;
      const summary = await getSummaryWithClient(client, mallId);
      await client.query("COMMIT");
      return res.status(201).json({ reported: true, alreadyReported: false, hidden, summary });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Could not save review report", error);
      return res.status(500).json({ error: "reviews_failed" });
    } finally {
      client.release();
    }
  });

  app.delete("/api/reviews/:mallId/:reviewId", async (req, res) => {
    const { mallId, reviewId: rawReviewId } = req.params;
    const deleteToken = req.body?.deleteToken;
    if (!validMallIds.has(mallId)) return res.status(404).json({ error: "mall_not_found" });
    if (!/^\d+$/.test(rawReviewId) || typeof deleteToken !== "string" || deleteToken.length > 128) {
      return res.status(400).json({ error: "invalid_delete" });
    }
    if (!pool) return databaseUnavailable(res);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `SELECT id, submission_hash
         FROM mall_reviews
         WHERE id = $1 AND mall_id = $2
         FOR UPDATE`,
        [rawReviewId, mallId],
      );
      if (!rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "review_not_found" });
      }

      const expectedToken = reviewDeleteToken(rows[0].id, rows[0].submission_hash);
      if (!deleteTokenMatches(deleteToken, expectedToken)) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "delete_not_allowed" });
      }

      await client.query("DELETE FROM mall_reviews WHERE id = $1 AND mall_id = $2", [rawReviewId, mallId]);
      const summary = await getSummaryWithClient(client, mallId);
      await client.query("COMMIT");
      return res.json({ deleted: true, summary });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Could not delete review", error);
      return res.status(500).json({ error: "reviews_failed" });
    } finally {
      client.release();
    }
  });

  app.post("/api/reviews/:mallId", async (req, res) => {
    const { mallId } = req.params;
    const rating = Number(req.body?.rating);
    const comment = normalizeComment(req.body?.comment);

    if (!validMallIds.has(mallId)) return res.status(404).json({ error: "mall_not_found" });
    if (!pool) return databaseUnavailable(res);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "invalid_rating" });
    }
    if (comment && Array.from(comment).length > 600) {
      return res.status(400).json({ error: "comment_too_long" });
    }
    const fingerprint = submissionHash(req);
    if (!fingerprint) return databaseUnavailable(res);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [fingerprint]);
      const { rows: recent } = await client.query(
        `SELECT COUNT(*)::int AS count FROM mall_reviews
         WHERE submission_hash = $1 AND created_at > NOW() - INTERVAL '15 minutes'`,
        [fingerprint],
      );
      if (recent[0].count >= MAX_SUBMISSIONS_PER_WINDOW) {
        await client.query("ROLLBACK");
        return res.status(429).json({ error: "rate_limited" });
      }
      const { rows } = await client.query(
        `INSERT INTO mall_reviews (mall_id, rating, comment, submission_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, rating, comment, created_at`,
        [mallId, rating, comment, fingerprint],
      );
      const summary = await getSummaryWithClient(client, mallId);
      await client.query("COMMIT");
      const review = reviewResponse(rows[0]);
      return res.status(201).json({
        review,
        summary,
        deleteToken: reviewDeleteToken(review.id, fingerprint),
      });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Could not save review", error);
      return res.status(500).json({ error: "reviews_failed" });
    } finally {
      client.release();
    }
  });
}

const app = express();
const httpServer = createServer(app);
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "2kb" }));
configureReviewsApi(app);

if (isProduction) {
  // Canonical SEO URLs map to pre-rendered directory index files. Static
  // middleware must handle those files before the SPA fallback.
  app.use(express.static(path.join(__dirname, "dist")));
  app.use((req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server: httpServer } },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

httpServer.listen(PORT, "0.0.0.0", () => {
  const address = httpServer.address();
  const activePort = typeof address === "object" && address ? address.port : PORT;
  console.log(`Shopeando is listening on port ${activePort}`);
});