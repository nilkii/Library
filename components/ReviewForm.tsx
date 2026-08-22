import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import type { ReviewDTO } from "@/types/models";

interface ReviewFormValues {
  comment: string;
}

interface ReviewFormProps {
  bookId: string;
  existingReview?: ReviewDTO | null;
  onSubmitted: (review: ReviewDTO) => void;
}

export default function ReviewForm({ bookId, existingReview, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({ defaultValues: { comment: existingReview?.comment ?? "" } });

  const onSubmit = async (data: ReviewFormValues) => {
    setStatus(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, rating, comment: data.comment }),
      });
      const result = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: result.message ?? "Diçka shkoi keq." });
        return;
      }

      setStatus({ type: "success", text: "Faleminderit për vlerësimin!" });
      onSubmitted(result);
      if (!existingReview) reset();
    } catch {
      setStatus({ type: "error", text: "Problem me lidhjen. Provo përsëri." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="lib-label">Vlerësimi</label>
      <div className="mb-4 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} yje`}
            className="cursor-pointer border-0 bg-transparent p-0.5"
            style={{ color: value <= rating ? "var(--gold)" : "color-mix(in srgb, var(--text) 22%, transparent)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M11.5 2.6a.6.6 0 0 1 1 0l2.6 5.3 5.8.8a.6.6 0 0 1 .3 1l-4.2 4.1 1 5.8a.6.6 0 0 1-.9.6L12 17.5l-5.2 2.7a.6.6 0 0 1-.9-.6l1-5.8-4.2-4.1a.6.6 0 0 1 .3-1l5.8-.8z" />
            </svg>
          </button>
        ))}
      </div>

      <label htmlFor="comment" className="lib-label">
        Komenti
      </label>
      <textarea
        id="comment"
        rows={3}
        className="lib-input mb-1 resize-y"
        {...register("comment", {
          required: "Komenti është i detyrueshëm.",
          minLength: { value: 3, message: "Të paktën 3 karaktere." },
        })}
      />
      {errors.comment && <p className="mb-3 text-sm text-red-600">{errors.comment.message}</p>}

      {status && (
        <p className={`mb-3 text-sm ${status.type === "success" ? "" : "text-red-600"}`} style={status.type === "success" ? { color: "var(--ok)" } : undefined}>
          {status.text}
        </p>
      )}

      <Button type="submit" size="sm" isLoading={isSubmitting}>
        {existingReview ? "Përditëso vlerësimin" : "Posto vlerësimin"}
      </Button>
    </form>
  );
}
