import { useCallback, useEffect, useState } from "react";
import { ExternalLink, ShoppingBag, Star } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { loadGoogleMaps } from "../utils/googleMaps";

function formatAverage(average, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : "es-CL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average);
}

function formatGoogleRating(rating, lang) {
  return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : "es-CL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}

export function GoogleMapsRating({ mall, mapsUrl }) {
  const { t, lang } = useLanguage();
  const labels = t.reviews;
  const [placeData, setPlaceData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setPlaceData(null);
    loadGoogleMaps()
      .then(async (googleMaps) => {
        const Place = googleMaps?.places?.Place;
        if (!Place?.searchByText) throw new Error("places_unavailable");
        const { places = [] } = await Place.searchByText({
          textQuery: mall.mapsQuery || `${mall.name}, ${mall.commune}, Santiago, Chile`,
          fields: ["displayName", "rating", "userRatingCount"],
          maxResultCount: 1,
        });
        const place = places[0];
        if (!active) return;
        if (typeof place?.rating === "number") {
          setPlaceData({ rating: place.rating, count: place.userRatingCount || 0 });
          setStatus("ready");
        } else {
          setStatus("unavailable");
        }
      })
      .catch(() => {
        if (active) setStatus("unavailable");
      });
    return () => { active = false; };
  }, [mall]);

  return (
    <div id="google-maps-rating" className="rounded-2xl border border-blue-200/70 bg-blue-50/45 p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">{labels.googleTitle}</h2>
          <p className="mt-1 text-sm text-ink/50">{labels.googleSubtitle}</p>
        </div>
        {status === "ready" && (
          <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
            <p className="flex items-center justify-end gap-1 text-lg font-extrabold text-amber-500">
              <Star size={16} fill="currentColor" aria-hidden="true" />
              {formatGoogleRating(placeData.rating, lang)} / 5
            </p>
            {placeData.count > 0 && (
              <p className="text-[11px] font-bold text-ink/45">
                {labels.googleCount.replace("{count}", placeData.count)}
              </p>
            )}
          </div>
        )}
      </div>
      {status === "loading" && <p className="mt-4 text-sm font-medium text-ink/45">{labels.googleLoading}</p>}
      {status === "unavailable" && (
        <p className="mt-4 text-sm font-medium text-ink/50">
          {labels.googleUnavailable}{" "}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-leaf underline">
            {labels.googleOpen}
          </a>
        </p>
      )}
      {status === "ready" && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-leaf hover:underline">
          <ExternalLink size={13} /> {labels.googleOpen}
        </a>
      )}
    </div>
  );
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
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}