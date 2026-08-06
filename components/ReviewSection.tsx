"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: string;
  user: { name: string };
};

type Props = {
  animeSlug: string;
  isLoggedIn: boolean;
  currentUserId?: string;
};

export default function ReviewSection({
  animeSlug,
  isLoggedIn,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const myReview = reviews.find((r) => r.userId === currentUserId);

async function load() {
  setLoading(true);

  try {
    const res = await fetch(`/api/anime/${animeSlug}/reviews`);

    if (!res.ok) {
      setReviews([]);
      setAverage(null);
      return;
    }

    const data = await res.json();

    setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    setAverage(
      typeof data.average === "number"
        ? data.average
        : null
    );
  } catch (err) {
    console.error(err);
    setReviews([]);
    setAverage(null);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeSlug]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    }
  }, [myReview]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (rating === 0) {
      setError("กรุณาให้คะแนนก่อน");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/anime/${animeSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("ลบรีวิวของคุณ?")) return;
    await fetch(`/api/anime/${animeSlug}/reviews`, { method: "DELETE" });
    setRating(0);
    setComment("");
    await load();
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold">รีวิวจากผู้ชม</h2>
        {average !== null && (
          <span className="text-sm text-[#ffc857] font-semibold">
            ★ {average.toFixed(1)} ({reviews.length} รีวิว)
          </span>
        )}
      </div>

      {/* Write / edit review */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#131320] border border-[#232335] rounded-xl p-4 mb-6"
      >
        <p className="text-xs text-[#8a87a3] mb-2">
          {isLoggedIn ? (myReview ? "แก้ไขรีวิวของคุณ" : "ให้คะแนนเรื่องนี้") : "เข้าสู่ระบบเพื่อรีวิว"}
        </p>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => (isLoggedIn ? setRating(star) : router.push("/login"))}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl leading-none"
            >
              <span
                className={
                  (hoverRating || rating) >= star ? "text-[#ffc857]" : "text-[#2a2a3d]"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>

        {error && <p className="text-[#ff9aa8] text-xs mb-2">{error}</p>}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!isLoggedIn}
          rows={2}
          placeholder={isLoggedIn ? "เขียนความเห็นของคุณ (ไม่บังคับ)" : ""}
          className="w-full bg-[#0b0b12] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5d73] resize-none mb-3 disabled:opacity-50"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#ff5d73] hover:bg-[#ff738a] transition text-[#0b0b12] font-semibold rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            {!isLoggedIn ? "เข้าสู่ระบบเพื่อรีวิว" : saving ? "กำลังบันทึก..." : myReview ? "บันทึกการแก้ไข" : "ส่งรีวิว"}
          </button>
          {myReview && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm border border-[#2a2a3d] text-[#8a87a3] hover:text-[#e8e6f0]"
            >
              ลบรีวิว
            </button>
          )}
        </div>
      </form>

      {/* Review list */}
      {loading ? (
        <p className="text-[#8a87a3] text-sm">กำลังโหลดรีวิว...</p>
      ) : reviews.length === 0 ? (
        <p className="text-[#8a87a3] text-sm">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวเรื่องนี้สิ</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-[#131320] border border-[#232335] rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{r.user.name}</span>
                <span className="text-[#ffc857] text-xs">
                  {"★".repeat(r.rating)}
                  <span className="text-[#2a2a3d]">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              {r.comment && <p className="text-sm text-[#a8a5bd]">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
