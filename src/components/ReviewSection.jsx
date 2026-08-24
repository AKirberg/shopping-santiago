import { useCallback, useEffect, useState } from "react";
import { Flag, ShoppingBag } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function formatAverage(average, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : "es-CL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average);
}

function BagRating({ value, onChange, disabled, labels, inputName }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((score) => {
        const selected = score <= value;
        return (
          <label
            key={score}
            className={`cursor-pointer rounded-lg p-1.5 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-leaf focus-within:ring-offset-2 ${
              selected ? "bg-leaf text-white" : "bg-mist text-ink/35 hover:bg-leaf/12 hover:text-leaf"
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name={inputName}
              value={score}
              checked={score === value}
              disabled={disabled}
              onChange={() => onChange(score)}
              aria-label={labels.ratingOption.replace("{score}", score)}
            />
            <ShoppingBag size={17} fill={selected ? "currentColor" : "none"} aria-hidden="true" />
          </label>
        );
      })}
    </div>
  );
}

export function ReviewSummary({ mallId }) {
  const { t, lang } = useLanguage();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reviews/${encodeURIComponent(mallId)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setSummary(data?.summary || null))
      .catch((error) => { if (error.name !== "AbortError") setSummary(null); });
    return () => controller.abort();
  }, [mallId]);

  const average = summary?.average || 0;
  const count = summary?.count || 0;
  return (
    <div
      className="flex items-center gap-2"
      aria-label={count
        ? t.reviews.shopeandoSummary.replace("{average}", formatAverage(average, lang)).replace("{count}", count)
        : t.reviews.shopeandoNoReviews}
    >
      <span className="flex items-center gap-0.5 text-gold" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((score) => (
          <ShoppingBag key={score} size={13} fill={score <= Math.round(average) ? "currentColor" : "none"} />
        ))}
      </span>
      <span className="text-xs font-bold text-ink/50">
        {count ? `${t.reviews.shopeandoLabel}: ${formatAverage(average, lang)} · ${count}` : t.reviews.shopeandoNoReviews}
      </span>
    </div>
  );
}

export default function ReviewSection({ mallId }) {
  const { t, lang } = useLanguage();
  const labels = t.reviews;
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState(null);

  const loadReviews = useCallback(async (signal) => {
    setStatus("loading");
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(mallId)}`, { signal });
      if (!response.ok) throw new Error("load_failed");
      setData(await response.json());
      setStatus("ready");
    } catch (error) {
      if (error.name !== "AbortError") {
        setStatus("error");
        setMessage(labels.loadError);
      }
    }
  }, [mallId, labels.loadError]);

  useEffect(() => {
    const controller = new AbortController();
    loadReviews(controller.signal);
    return () => controller.abort();
  }, [loadReviews]);

  async function submitReview(event) {
    event.preventDefault();
    if (!rating || status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(mallId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const result = await response.json();
      if (!response.ok) {
        const errors = {
          rate_limited: labels.rateLimited,
          comment_too_long: labels.commentTooLong,
          reviews_unavailable: labels.submitError,
        };
        throw new Error(errors[result.error] || labels.submitError);
      }
      setData((previous) => ({
        summary: result.summary,
        reviews: [result.review, ...(previous?.reviews || [])],
      }));
      setRating(0);
      setComment("");
      setStatus("ready");
      setMessage(labels.success);
    } catch (error) {
      setStatus("ready");
      setMessage(error.message || labels.submitError);
    }
  }

  function openReportForm(reviewId) {
    setReportingReviewId(reviewId);
    setReportReason("");
    setReportStatus(null);
  }

  async function submitReport(event, reviewId) {
    event.preventDefault();
    if (!reportReason || reportStatus?.state === "submitting") return;
    setReportStatus({ reviewId, state: "submitting" });
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(mallId)}/${encodeURIComponent(reviewId)}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });
      const result = await response.json();
      if (!response.ok) {
        const errors = {
          report_rate_limited: labels.reportRateLimited,
          invalid_report: labels.reportError,
          review_not_found: labels.reportError,
          reviews_unavailable: labels.reportError,
        };
        throw new Error(errors[result.error] || labels.reportError);
      }
      setData((previous) => previous && ({
        ...previous,
        summary: result.summary || previous.summary,
        reviews: result.hidden
          ? previous.reviews.filter((review) => review.id !== reviewId)
          : previous.reviews,
      }));
      setReportStatus({
        reviewId,
        state: "success",
        message: result.hidden ? labels.reportHidden : labels.reportSuccess,
      });
      setMessage(result.hidden ? labels.reportHidden : "");
    } catch (error) {
      setReportStatus({ reviewId, state: "error", message: error.message || labels.reportError });
    }
  }

  function closeReportForm() {
    setReportingReviewId(null);
    setReportReason("");
    setReportStatus(null);
  }

  const summary = data?.summary;
  return (
    <section className="mt-8 rounded-2xl border border-ink/8 bg-white p-5 sm:p-6" aria-labelledby={`reviews-${mallId}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id={`reviews-${mallId}`} className="font-display text-xl font-extrabold text-ink">{labels.shopeandoTitle}</h2>
          <p className="mt-1 text-sm text-ink/50">{labels.subtitle}</p>
        </div>
        {summary?.count > 0 && (
          <div className="rounded-xl bg-gold/12 px-3 py-2 text-right">
            <p className="text-lg font-extrabold text-gold">{formatAverage(summary.average, lang)} / 5</p>
            <p className="text-[11px] font-bold text-ink/45">{labels.count.replace("{count}", summary.count)}</p>
          </div>
        )}
      </div>

      <form className="mt-5 rounded-xl bg-mist p-4" onSubmit={submitReview}>
        <fieldset disabled={status === "submitting"}>
          <legend className="text-sm font-extrabold text-ink/75">{labels.yourRating}</legend>
          <div className="mt-2">
            <BagRating value={rating} onChange={setRating} disabled={status === "submitting"} labels={labels} inputName={`review-rating-${mallId}`} />
          </div>
          <label className="mt-4 block text-sm font-extrabold text-ink/75" htmlFor={`review-comment-${mallId}`}>{labels.commentLabel}</label>
          <textarea
            id={`review-comment-${mallId}`}
            value={comment}
            maxLength={600}
            onChange={(event) => setComment(event.target.value)}
            placeholder={labels.commentPlaceholder}
            className="mt-2 min-h-24 w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-leaf focus:ring-2 focus:ring-leaf/20"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-ink/40">{comment.length}/600 · {labels.publicNotice}</span>
            <button type="submit" disabled={!rating || status === "submitting"} className="primary-button py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
              {status === "submitting" ? labels.submitting : labels.submit}
            </button>
          </div>
        </fieldset>
      </form>

      <div className="mt-4 min-h-6" aria-live="polite">
        {status === "loading" && <p className="text-sm font-medium text-ink/45">{labels.loading}</p>}
        {status === "error" && <button type="button" onClick={() => loadReviews()} className="text-sm font-bold text-coral underline">{message} {labels.retry}</button>}
        {message && status !== "error" && <p className={`text-sm font-bold ${message === labels.success ? "text-leaf" : "text-coral"}`}>{message}</p>}
      </div>

      {status !== "loading" && data?.reviews?.length === 0 && <p className="mt-2 text-sm text-ink/50">{labels.empty}</p>}
      {data?.reviews?.length > 0 && (
        <ol className="mt-3 grid gap-3">
          {data.reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-ink/7 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-0.5 text-leaf" aria-label={labels.ratingOption.replace("{score}", review.rating)}>
                  {Array.from({ length: review.rating }).map((_, index) => <ShoppingBag key={index} size={13} fill="currentColor" aria-hidden="true" />)}
                </span>
                <time className="text-xs font-medium text-ink/40" dateTime={review.createdAt}>
                  {new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : "es-CL", { dateStyle: "medium" }).format(new Date(review.createdAt))}
                </time>
              </div>
              {review.comment && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/65">{review.comment}</p>}
              <div className="mt-3 flex justify-end">
                {reportingReviewId !== review.id ? (
                  <button
                    type="button"
                    onClick={() => openReportForm(review.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-ink/45 transition hover:bg-coral/8 hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral/40"
                    aria-label={`${labels.report}: ${review.comment || labels.ratingOption.replace("{score}", review.rating)}`}
                  >
                    <Flag size={13} aria-hidden="true" />
                    {labels.report}
                  </button>
                ) : (
                  <form className="w-full rounded-xl bg-coral/5 p-3" onSubmit={(event) => submitReport(event, review.id)}>
                    <fieldset disabled={reportStatus?.state === "submitting"}>
                      <legend className="text-xs font-extrabold text-ink/70">{labels.reportPrompt}</legend>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        {Object.entries(labels.reportReasons).map(([value, label]) => (
                          <label key={value} className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink/65">
                            <input
                              type="radio"
                              name={`report-reason-${review.id}`}
                              value={value}
                              checked={reportReason === value}
                              onChange={() => setReportReason(value)}
                              className="accent-coral"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        {reportStatus?.state === "error" && (
                          <p className="mr-auto text-xs font-bold text-coral" role="alert">{reportStatus.message}</p>
                        )}
                        {reportStatus?.state === "success" ? (
                          <p className="mr-auto text-xs font-bold text-leaf" role="status">{reportStatus.message}</p>
                        ) : (
                          <>
                            <button type="button" onClick={closeReportForm} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-ink/50 hover:bg-ink/5">
                              {labels.reportCancel}
                            </button>
                            <button type="submit" disabled={!reportReason || reportStatus?.state === "submitting"} className="rounded-lg bg-coral px-2.5 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                              {reportStatus?.state === "submitting" ? labels.reportSubmitting : labels.reportSubmit}
                            </button>
                          </>
                        )}
                      </div>
                    </fieldset>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}