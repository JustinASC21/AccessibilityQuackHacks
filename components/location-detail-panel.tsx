"use client";

import { useEffect, useState } from "react";

const LOCATION_REVIEWS_STORAGE_KEY = "location-reviews-v1";

// ─── Hardcoded Reviews ───────────────────────────────────────────────────────
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

// ─── Types ──────────────────────────────────────────────────────────────────
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

// ─── Star display ────────────────────────────────────────────────────────────
function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          className={`w-6 h-6 ${i < count ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-700"}`}
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
    <span className={`inline-flex items-center gap-2 text-[22px] font-semibold border rounded-full px-3 py-1 ${colors}`}>
      <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 110 2 1 1 0 010-2zm0 3.5c.55 0 1 .45 1 1v4a1 1 0 01-2 0v-4c0-.55.45-1 1-1z" />
      </svg>
      Comfort {score}/5
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors =
    status === "Resolved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
      : status === "In Review"
        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
        : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

  return (
    <span className={`text-base font-semibold border rounded-full px-3 py-1 ${colors}`}>
      {status}
    </span>
  );
}

// ─── Average helpers ──────────────────────────────────────────────────────────
function avgStars(reviews: ReviewCard[]) {
  if (!reviews.length) return "0.0";
  return (reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1);
}
function avgComfort(reviews: ReviewCard[]) {
  if (!reviews.length) return "0.0";
  return (reviews.reduce((sum, review) => sum + review.comfort, 0) / reviews.length).toFixed(1);
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ reviews }: { reviews: ReviewCard[] }) {
  return (
    <div className="flex flex-col gap-0">

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {reviews.map((review) => (
          <div key={review.id} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xl font-bold flex items-center justify-center shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-[22px] font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
                    {review.author}
                  </p>
                  <p className="text-xl text-zinc-400">{review.date}</p>
                </div>
              </div>
              <ComfortBadge score={review.comfort} />
            </div>
            <Stars count={review.stars} />
            <p className="mt-2 text-[22px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {review.comment}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[22px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full px-3 py-1"
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
        className="w-full min-h-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-lg outline-none focus:ring-2 focus:ring-sky-400"
      />
      <button
        type="button"
        onClick={onAddReview}
        disabled={!reviewText.trim()}
        className="rounded-lg bg-sky-600 px-3 py-2 text-lg font-semibold text-white disabled:opacity-40"
      >
        Add Review
      </button>
    </div>
  );
}

// ─── Service Request Tab ──────────────────────────────────────────────────────
interface ServiceRequest {
  id: number;
  issueType: string;
  description: string;
  date: string;
  status: string;
}

function ServiceRequestTab() {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const handleSubmit = () => {
    if (!issueType) return;
    const newRequest: ServiceRequest = {
      id: Date.now(),
      issueType,
      description,
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      status: "Pending",
    };
    setRequests((prev) => [newRequest, ...prev]);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 px-5">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Request submitted!</p>
        <p className="text-md text-zinc-400 text-center">
          Thank you for helping improve accessibility in NYC.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setIssueType("");
            setDescription("");
          }}
          className="text-lg text-sky-600 hover:underline mt-1"
        >
          Submit another
        </button>
      </div>
    );
  }

  if (showPast) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setShowPast(false)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Submitted Requests</p>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 gap-2 text-zinc-400 dark:text-zinc-600">
            <p className="text-lg">No requests submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {requests.map((req) => (
              <div key={req.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{req.issueType}</p>
                  <StatusBadge status={req.status} />
                </div>
                {req.description && (
                  <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {req.description}
                  </p>
                )}
                <p className="text-[10px] text-zinc-400 mt-1.5">{req.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <div>
        <p className="text-xlg font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
          Issue Type
        </p>
        <div className="flex flex-wrap gap-2">
          {["Broken Ramp", "Elevator Down", "Blocked Access", "Poor Lighting", "Other"].map((type) => (
            <button
              key={type}
              onClick={() => setIssueType(type)}
              className={`text-md px-3 py-1.5 rounded-full border transition-colors ${
                issueType === type
                  ? "bg-sky-500 border-sky-500 text-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-sky-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xlg font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
          Description
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue..."
          rows={3}
          className="w-full text-lg rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!issueType}
        className="w-full py-2.5 rounded-xl text-lg font-semibold bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Submit Request
      </button>

      <button
        onClick={() => setShowPast(true)}
        className="w-full py-2.5 rounded-xl text-lg font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 transition-colors"
      >
        Submitted Requests {requests.length > 0 && `(${requests.length})`}
      </button>
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
  const [isPanelVisible, setIsPanelVisible] = useState(false);

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

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsPanelVisible(true);
    });

    return () => window.cancelAnimationFrame(frameId);
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

  const averageStars = avgStars(mergedReviews);
  const averageComfort = avgComfort(mergedReviews);

  return (
    <div
      className={`absolute bottom-4 right-4 z-50 flex flex-col items-end gap-3 transition-all duration-700 ease-out ${
        isPanelVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-32 h-24 rounded-full border-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 flex flex-col items-center justify-center">
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 leading-none">
              {averageStars}
            </p>
            <p className="mt-1 text-[18px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
              Reviews
            </p>
          </div>

          <div className="w-32 h-24 rounded-full border-4 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 flex flex-col items-center justify-center">
            <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 leading-none">
              {averageComfort}
            </p>
            <p className="mt-1 text-[18px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
              Comfort
            </p>
          </div>
        </div>
      </div>

      <div className="w-[640px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[560px]">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-[30px] text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                  {locationName}
                </h2>
                <p className="text-lg text-zinc-400 mt-0.5 leading-snug line-clamp-1">{address}</p>
              </div>
            </div>
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

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-lg font-semibold tracking-wide transition-colors relative ${
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

        {/* Content */}
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
    </div>
  );
}