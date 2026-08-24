import { useCallback, useEffect, useState } from "react";
import { Check, Flag, ShoppingBag, Trash2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const DELETE_TOKENS_KEY = "shopeando-review-delete-tokens-v1";

function readDeleteTokens() {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(DELETE_TOKENS_KEY) || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    return {};
  }
}

function saveDeleteTokens(tokens) {
  try {
    window.localStorage.setItem(DELETE_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // Deletion remains available for the current page even if storage is blocked.
  }
}

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
            <ShoppingBag
              size={17}
              fill="none"
              strokeWidth={selected ? 2.4 : 2}
              aria-hidden="true"
            />
          </label>
        );
      })}
    </div>
  );
}

export function QuickReviewRating({ mallId }) {
  const { t, lang } = useLanguage();
  const labels = t.reviews;
  const [summary, setSummary] = useState(null);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [selectedScore, setSelectedScore] = useState(0);
  const [quickStatus, setQuickStatus] = useState("ready");
  const [quickMessage, setQuickMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reviews/${encodeURIComponent(mallId)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setSummary(data?.summary || null))
      .catch((error) => { if (error.name !== "AbortError") setSummary(null); });
    return () => controller.abort();
  }, [mallId]);

  async function submitQuickRating(score) {
    if (quickStatus === "submitting" || quickStatus === "success") return;
    setSelectedScore(score);
    setHoveredScore(0);
    setQuickStatus("submitting");
    setQuickMessage("");
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(mallId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: score, comment: "" }),
      });
      const result = await response.json();
      if (!response.ok) {
        const errors = {
          rate_limited: labels.rateLimited,
          reviews_unavailable: labels.submitError,
        };
        throw new Error(errors[result.error] || labels.submitError);
      }
      setSummary(result.summary);
      if (result.deleteToken) {
        saveDeleteTokens({
          ...readDeleteTokens(),
          [result.review.id]: result.deleteToken,
        });
      }
      setQuickStatus("success");
      setQuickMessage(labels.quickSuccess);
    } catch (error) {
      setSelectedScore(0);
      setQuickStatus("error");
      setQuickMessage(error.message || labels.submitError);
    }
  }

  const average = summary?.average || 0;
  const count = summary?.count || 0;
  const displayScore = hoveredScore || selectedScore || Math.round(average);
  const isChoosing = hoveredScore > 0 || selectedScore > 0;
  const isDisabled = quickStatus === "submitting" || quickStatus === "success";

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-0.5 rounded-full border p-1 shadow-card backdrop-blur-md transition ${
          quickStatus === "success"
            ? "border-leaf/40 bg-white"
            : quickStatus === "error"
              ? "border-coral/50 bg-white"
              : "border-white bg-white"
        }`}
        aria-label={count
          ? t.reviews.shopeandoSummary.replace("{average}", formatAverage(average, lang)).replace("{count}", count)
          : labels.quickRating}
      >
        {[1, 2, 3, 4, 5].map((score) => {
          const active = score <= displayScore;
          const activeClass = isChoosing
            ? "bg-leaf text-white"
            : "bg-gold text-white";
          return (
            <button
              key={score}
              type="button"
              onMouseEnter={() => !isDisabled && setHoveredScore(score)}
              onMouseLeave={() => setHoveredScore(0)}
              onFocus={() => !isDisabled && setHoveredScore(score)}
              onBlur={() => setHoveredScore(0)}
              onClick={() => submitQuickRating(score)}
              disabled={isDisabled}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-leaf focus:ring-offset-1 disabled:cursor-default ${
                active ? activeClass : "text-gold hover:bg-gold/10"
              }`}
              aria-label={labels.ratingOption.replace("{score}", score)}
              title={labels.ratingOption.replace("{score}", score)}
            >
              <ShoppingBag size={14} fill="none" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
            </button>
          );
        })}
        {quickStatus === "success" && <Check size={14} className="mx-1 text-leaf" strokeWidth={3} aria-hidden="true" />}
      </div>
      {quickMessage && (
        <p
          className={`absolute right-0 top-full z-20 mt-1 w-max max-w-56 rounded-lg px-2 py-1 text-right text-[10px] font-extrabold text-white shadow ${
            quickStatus === "success" ? "bg-leaf" : "bg-coral"
          }`}
          role={quickStatus === "error" ? "alert" : "status"}
        >
          {quickMessage}
        </p>
      )}
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
  const [deleteTokens, setDeleteTokens] = useState(readDeleteTokens);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);

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
      if (result.deleteToken) {
        setDeleteTokens((previous) => {
          const next = { ...previous, [result.review.id]: result.deleteToken };
          saveDeleteTokens(next);
          return next;
        });
      }
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

  async function deleteReview(reviewId) {
    const deleteToken = deleteTokens[reviewId];
    if (!deleteToken || deleteStatus?.state === "submitting") return;
    setDeleteStatus({ reviewId, state: "submitting" });
    try {
      const response = await fetch(`/api/reviews/${encodeURIComponent(mallId)}/${encodeURIComponent(reviewId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteToken }),
      });
      const result = await response.json();
      if (!response.ok) {
        const errors = {
          delete_not_allowed: labels.deleteNotAllowed,
          invalid_delete: labels.deleteError,
          review_not_found: labels.deleteError,
          reviews_unavailable: labels.deleteError,
        };
        throw new Error(errors[result.error] || labels.deleteError);
      }
      setData((previous) => previous && ({
        ...previous,
        summary: result.summary,
        reviews: previous.reviews.filter((review) => review.id !== reviewId),
      }));
      setDeleteTokens((previous) => {
        const next = { ...previous };
        delete next[reviewId];
        saveDeleteTokens(next);
        return next;
      });
      setConfirmingDeleteId(null);
      setDeleteStatus(null);
      setMessage(labels.deleteSuccess);
    } catch (error) {
      setDeleteStatus({ reviewId, state: "error", message: error.message || labels.deleteError });
    }
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
        {message && status !== "error" && <p className={`text-sm font-bold ${[labels.success, labels.deleteSuccess, labels.reportHidden].includes(message) ? "text-leaf" : "text-coral"}`}>{message}</p>}
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
                {confirmingDeleteId === review.id ? (
                  <div className="flex w-full flex-wrap items-center justify-end gap-2 rounded-xl bg-coral/5 p-3">
                    <p className="mr-auto text-xs font-bold text-ink/65">{labels.deleteConfirm}</p>
                    {deleteStatus?.reviewId === review.id && deleteStatus.state === "error" && (
                      <p className="w-full text-xs font-bold text-coral" role="alert">{deleteStatus.message}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingDeleteId(null);
                        setDeleteStatus(null);
                      }}
                      disabled={deleteStatus?.state === "submitting"}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-ink/50 hover:bg-ink/5 disabled:opacity-50"
                    >
                      {labels.deleteCancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReview(review.id)}
                      disabled={deleteStatus?.state === "submitting"}
                      className="rounded-lg bg-coral px-2.5 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteStatus?.state === "submitting" ? labels.deleting : labels.deleteConfirmAction}
                    </button>
                  </div>
                ) : reportingReviewId !== review.id ? (
                  <div className="flex items-center gap-1">
                    {deleteTokens[review.id] && (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingDeleteId(review.id);
                          setDeleteStatus(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-ink/45 transition hover:bg-coral/8 hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral/40"
                        aria-label={`${labels.delete}: ${review.comment || labels.ratingOption.replace("{score}", review.rating)}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        {labels.delete}
                      </button>
                    )}
                  <button
                    type="button"
                    onClick={() => openReportForm(review.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-ink/45 transition hover:bg-coral/8 hover:text-coral focus:outline-none focus:ring-2 focus:ring-coral/40"
                    aria-label={`${labels.report}: ${review.comment || labels.ratingOption.replace("{score}", review.rating)}`}
                  >
                    <Flag size={13} aria-hidden="true" />
                    {labels.report}
                  </button>
                  </div>
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