"use client";

import { useEffect, useState } from "react";

const LOCATION_REVIEWS_STORAGE_KEY = "location-reviews-v1";

// ─── Hardcoded Reviews ────────────────────────────────────────────────────────
const REVIEWS = [
  {
    id: 1,
    author: "Maya R.",
    avatar: "M",
    date: "Feb 2026",
    comfort: 4,
    stars: 5,
    comment:
      "Really clean and well-maintained. Automatic doors made it easy to enter with my wheelchair. Highly recommend for anyone in the area.",
    tags: ["Wheelchair Access", "Clean", "Well-lit"],
  },
  {
    id: 2,
    author: "James T.",
    avatar: "J",
    date: "Jan 2026",
    comfort: 3,
    stars: 3,
    comment:
      "Decent accessibility but the ramp was a bit steep. The space inside was roomy enough. Could use better signage.",
    tags: ["Ramp Available", "Spacious"],
  },
  {
    id: 3,
    author: "Sofia L.",
    avatar: "S",
    date: "Jan 2026",
    comfort: 5,
    stars: 5,
    comment:
      "One of the best accessible restrooms I've found in NYC. Grab bars on both sides, plenty of turning radius, and the attendant was super helpful.",
    tags: ["Grab Bars", "Attendant On-site", "5-star"],
  },
  {
    id: 4,
    author: "Derek W.",
    avatar: "D",
    date: "Dec 2025",
    comfort: 2,
    stars: 2,
    comment:
      "Door was difficult to open independently and the accessible stall was occupied by someone who didn't need it. Frustrating experience.",
    tags: ["Needs Improvement", "Heavy Door"],
  },
  {
    id: 5,
    author: "Priya N.",
    avatar: "P",
    date: "Dec 2025",
    comfort: 4,
    stars: 4,
    comment:
      "Good overall. The fold-down changing table was a bonus. A little crowded on weekends but the layout handles it well.",
    tags: ["Changing Table", "Family-Friendly"],
  },
];

type ReviewCard = {
  id: number;
  author: string;
  avatar: string;
  date: string;
  comfort: number;
  stars: number;
  comment: string;
  tags: string[];
};

type StoredReview = {
  id: number;
  text: string;
  createdAt: string;
};

// ─── Star display ─────────────────────────────────────────────────────────────
function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          className={`w-3.5 h-3.5 ${i < count ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-700"}`}
        >
          <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.7 4.08L8 10.4l-3.7 2.1.7-4.08L2 5.5l4.15-.75z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Comfort Score Badge ──────────────────────────────────────────────────────
function ComfortBadge({ score }: { score: number }) {
  const colors =
    score >= 4
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
      : score === 3
        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold border rounded-full px-2 py-0.5 ${colors}`}>
      <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 110 2 1 1 0 010-2zm0 3.5c.55 0 1 .45 1 1v4a1 1 0 01-2 0v-4c0-.55.45-1 1-1z" />
      </svg>
      Comfort {score}/5
    </span>
  );
}

// ─── Average stars ────────────────────────────────────────────────────────────
function avgStars(reviews: ReviewCard[]) {
  if (!reviews.length) return "0.0";
  return (reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1);
}
function avgComfort(reviews: ReviewCard[]) {
  if (!reviews.length) return "0.0";
  return (reviews.reduce((sum, review) => sum + review.comfort, 0) / reviews.length).toFixed(1);
}

// ─── Reviews Tab ─────────────────────────────────────────────────────────────
function ReviewsTab({ reviews }: { reviews: ReviewCard[] }) {
  return (
    <div className="flex flex-col gap-0">
      {/* Summary strip */}
      <div className="flex items-center gap-6 px-5 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{avgStars(reviews)}</p>
          <Stars count={Math.round(Number(avgStars(reviews)))} />
          <p className="text-[10px] text-zinc-400 mt-0.5">{reviews.length} reviews</p>
        </div>
        <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{avgComfort(reviews)}</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">avg comfort</p>
          <p className="text-[10px] text-zinc-400">out of 5</p>
        </div>
      </div>

      {/* Review cards */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {reviews.map((review) => (
          <div key={review.id} className="px-5 py-4">
            {/* Row 1: avatar + name + date */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
                    {review.author}
                  </p>
                  <p className="text-[11px] text-zinc-400">{review.date}</p>
                </div>
              </div>
              <ComfortBadge score={review.comfort} />
            </div>

            {/* Row 2: stars */}
            <Stars count={review.stars} />

            {/* Row 3: comment */}
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {review.comment}
            </p>

            {/* Row 4: tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Add Review Tab ───────────────────────────────────────────────────────────
function AddReviewTab({
  reviewText,
  onReviewTextChange,
  onAddReview,
}: {
  reviewText: string;
  onReviewTextChange: (next: string) => void;
  onAddReview: () => void;
}) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <textarea
        value={reviewText}
        onChange={(event) => onReviewTextChange(event.target.value)}
        placeholder="Write your review..."
        className="w-full min-h-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
      />
      <button
        type="button"
        onClick={onAddReview}
        disabled={!reviewText.trim()}
        className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        Add Review
      </button>
    </div>
  );
}

// ─── Service Request Tab (placeholder) ───────────────────────────────────────
function ServiceRequestTab() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-400 dark:text-zinc-600">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="text-sm">Coming soon</p>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
type Tab = "reviews" | "add-review" | "service-request";

interface LocationDetailPanelProps {
  locationName?: string;
  address?: string;
  onClose?: () => void;
}

export function LocationDetailPanel({
  locationName = "Public Restroom",
  address = "123 W 34th St, New York, NY 10001",
  onClose,
}: LocationDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [reviewText, setReviewText] = useState("");
  const [reviewsByLocation, setReviewsByLocation] = useState<Record<string, StoredReview[]>>({});

  const locationKey = `${locationName}__${address}`;

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(LOCATION_REVIEWS_STORAGE_KEY);
      if (!stored) return;
      setReviewsByLocation(JSON.parse(stored) as Record<string, StoredReview[]>);
    } catch {
      setReviewsByLocation({});
    }
  }, []);

  const locationStoredReviews = reviewsByLocation[locationKey] ?? [];

  const mergedReviews: ReviewCard[] = [
    ...REVIEWS,
    ...locationStoredReviews.map((review) => ({
      id: review.id,
      author: "You",
      avatar: "Y",
      date: new Date(review.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      }),
      comfort: 4,
      stars: 4,
      comment: review.text,
      tags: ["User Review"],
    })),
  ];

  const addReview = () => {
    if (!reviewText.trim()) return;

    const newReview: StoredReview = {
      id: Date.now(),
      text: reviewText.trim(),
      createdAt: new Date().toISOString(),
    };

    const next = {
      ...reviewsByLocation,
      [locationKey]: [...locationStoredReviews, newReview],
    };

    setReviewsByLocation(next);
    window.sessionStorage.setItem(LOCATION_REVIEWS_STORAGE_KEY, JSON.stringify(next));
    setReviewText("");
    setActiveTab("reviews");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "reviews", label: "Reviews" },
    { id: "add-review", label: "Add Review" },
    { id: "service-request", label: "Service Req" },
  ];

  return (
    <div className="absolute bottom-4 right-4 w-[340px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[560px]">
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-[15px] text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                {locationName}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug line-clamp-1">{address}</p>
            </div>
          </div>
          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors relative ${
              activeTab === tab.id
                ? "text-sky-600 dark:text-sky-400"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-sky-500" />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "reviews" && <ReviewsTab reviews={mergedReviews} />}
        {activeTab === "add-review" && (
          <AddReviewTab
            reviewText={reviewText}
            onReviewTextChange={setReviewText}
            onAddReview={addReview}
          />
        )}
        {activeTab === "service-request" && <ServiceRequestTab />}
      </div>
    </div>
  );
}
