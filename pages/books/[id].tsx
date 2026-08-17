import { useState } from "react";
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import mongoose from "mongoose";
import { useSession } from "next-auth/react";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import Review from "@/models/Review";
import ReviewForm from "@/components/ReviewForm";
import { useFavorite } from "@/hooks/useFavorite";
import type { BookDTO, ReviewDTO } from "@/types/models";

interface BookDetailsProps {
  book: BookDTO;
  reviews: ReviewDTO[];
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    await dbConnect();
    const books = await Book.find().select("_id").lean<{ _id: mongoose.Types.ObjectId }[]>();

    return {
      paths: books.map((book) => ({ params: { id: book._id.toString() } })),
      fallback: "blocking",
    };
  } catch (error) {
    // No DB reachable at build time — pre-render nothing, let `blocking`
    // fallback generate pages on first request once the DB is available.
    console.error("Book getStaticPaths failed:", error);
    return { paths: [], fallback: "blocking" };
  }
};

export const getStaticProps: GetStaticProps<BookDetailsProps> = async ({ params }) => {
  await dbConnect();
  const id = params?.id as string;

  const book = await Book.findById(id).lean().catch(() => null);
  if (!book) {
    return { notFound: true, revalidate: 60 };
  }

  const reviews = await Review.find({ book: id }).sort({ createdAt: -1 }).lean();

  return {
    props: {
      book: JSON.parse(JSON.stringify(book)),
      reviews: JSON.parse(JSON.stringify(reviews)),
    },
    revalidate: 60,
  };
};

export default function BookDetails({
  book,
  reviews: initialReviews,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: session } = useSession();
  const { favorited, toggleFavorite, loading: favLoading } = useFavorite(book._id, false);
  const [reviews, setReviews] = useState(initialReviews);

  const myReview = session ? reviews.find((r) => r.user === session.user.id) : undefined;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmittedReview = (review: ReviewDTO) => {
    setReviews((prev) => {
      const existingIndex = prev.findIndex((r) => r._id === review._id);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = review;
        return copy;
      }
      return [review, ...prev];
    });
  };

  return (
    <div className="container-page py-12">
      <Head>
        <title>{book.title} — Libraria</title>
        <meta name="description" content={book.description.slice(0, 150)} />
      </Head>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative h-96 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <Image src={book.coverImage} alt={`Kapaku i librit ${book.title}`} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {book.genre}
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">{book.title}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">nga {book.author}</p>

          {averageRating && (
            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              ⭐ {averageRating} ({reviews.length} vlerësime)
            </p>
          )}

          <p className="mt-4 text-gray-700 dark:text-gray-300">{book.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">€{book.price.toFixed(2)}</span>
            <span className={`text-sm ${book.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {book.stock > 0 ? `${book.stock} në stok` : "Pa stok"}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <span aria-hidden>{favorited ? "❤️" : "🤍"}</span>
            {favorited ? "Në të preferuarat" : "Shto te të preferuarat"}
          </button>
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100">Vlerësimet</h2>

        {session ? (
          <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <ReviewForm bookId={book._id} existingReview={myReview} onSubmitted={handleSubmittedReview} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/login" className="text-brand-600 hover:underline dark:text-brand-400">
              Kyçu
            </Link>{" "}
            për të lënë një vlerësim.
          </p>
        )}

        <ul className="mt-8 space-y-4">
          {reviews.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Ende s&apos;ka vlerësime për këtë libër.</p>
          )}
          {reviews.map((review) => (
            <li key={review._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100">{review.userName}</span>
                <span className="text-yellow-600 dark:text-yellow-400">{"⭐".repeat(review.rating)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
