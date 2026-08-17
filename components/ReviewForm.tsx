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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Vlerësimi</label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} yje`}
              className="text-2xl leading-none"
            >
              {value <= rating ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Komenti
        </label>
        <textarea
          id="comment"
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          {...register("comment", {
            required: "Komenti është i detyrueshëm.",
            minLength: { value: 3, message: "Të paktën 3 karaktere." },
          })}
        />
        {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
      </div>

      {status && (
        <p className={`text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {status.text}
        </p>
      )}

      <Button type="submit" size="sm" isLoading={isSubmitting}>
        {existingReview ? "Përditëso vlerësimin" : "Posto vlerësimin"}
      </Button>
    </form>
  );
}
