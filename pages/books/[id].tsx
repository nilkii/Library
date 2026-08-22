import { useRef, useState } from "react";
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
import BookGrid from "@/components/BookGrid";
import { useLibraryStatus } from "@/hooks/useLibraryStatus";
import { useCart } from "@/context/CartContext";
import type { BookDTO, LibraryStatus, ReviewDTO } from "@/types/models";

interface BookDetailsProps {
  book: BookDTO;
  reviews: ReviewDTO[];
  relatedBooks: BookDTO[];
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

  const [reviews, relatedBooks] = await Promise.all([
    Review.find({ book: id }).sort({ createdAt: -1 }).lean(),
    Book.find({ genre: book.genre, _id: { $ne: id } }).limit(4).lean(),
  ]);

  return {
    props: {
      book: JSON.parse(JSON.stringify(book)),
      reviews: JSON.parse(JSON.stringify(reviews)),
      relatedBooks: JSON.parse(JSON.stringify(relatedBooks)),
    },
    revalidate: 60,
  };
};

const STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: "want", label: "Dua ta lexoj" },
  { value: "reading", label: "Po e lexoj" },
  { value: "read", label: "E lexuar" },
];

export default function BookDetails({
  book,
  reviews: initialReviews,
  relatedBooks,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: session } = useSession();
  const { status: libraryStatus, toggle: toggleLibraryStatus, loading: libraryLoading } = useLibraryStatus(book._id, null);
  const { addItem, items } = useCart();
  const [reviews, setReviews] = useState(initialReviews);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const reviewFormRef = useRef<HTMLDivElement>(null);

  const myReview = session ? reviews.find((r) => r.user === session.user.id) : undefined;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const inCartQty = items.find((i) => i.bookId === book._id)?.quantity ?? 0;
  const remainingStock = Math.max(0, book.stock - inCartQty);

  const metaEntries = [
    book.publishYear ? `${book.publishYear}` : null,
    book.pages ? `${book.pages} faqe` : null,
    book.language,
    book.publisher,
    book.isbn ? `ISBN ${book.isbn}` : null,
  ].filter(Boolean);

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

  const handleEditReview = () => {
    reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish vlerësimin tënd?")) return;
    setDeletingReviewId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleAddToCart = () => {
    addItem(
      { bookId: book._id, title: book.title, author: book.author, price: book.price, coverImage: book.coverImage, stock: book.stock },
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="container-page py-12">
      <Head>
        <title>{book.title} — Libraria</title>
        <meta name="description" content={book.description.slice(0, 150)} />
      </Head>

      <div className="grid gap-14 md:grid-cols-[.8fr_1.2fr] md:items-start">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(31,42,36,.3)]"
          style={{ background: "var(--surface-2)" }}
        >
          <Image src={book.coverImage} alt={`Kapaku i librit ${book.title}`} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
        </div>

        <div>
          <Link href={`/books/genre/${encodeURIComponent(book.genre)}`} className="lib-tag lib-link">
            {book.genre}
          </Link>
          <h1 className="mt-3.5 text-[clamp(30px,4vw,48px)] leading-[1.05]">{book.title}</h1>
          <p className="mt-1.5 text-muted">nga {book.author}</p>

          {metaEntries.length > 0 && (
            <p className="mt-2 text-sm text-muted">{metaEntries.join(" · ")}</p>
          )}

          {averageRating && (
            <p className="mt-2.5 text-sm font-semibold" style={{ color: "var(--gold)" }}>
              ⭐ {averageRating} ({reviews.length} vlerësime)
            </p>
          )}

          <p className="mt-6 max-w-[52ch] leading-relaxed">{book.description}</p>

          <div className="my-[26px] flex items-baseline gap-[18px]">
            <span className="font-display text-[32px]">€{book.price.toFixed(2)}</span>
            <span className={`text-sm font-semibold ${remainingStock > 0 ? "" : "text-red-500"}`} style={remainingStock > 0 ? { color: "var(--ok)" } : undefined}>
              {remainingStock > 0 ? `${remainingStock} në stok` : "Pa stok"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-full" style={{ border: "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Zvogëlo sasinë"
                className="h-11 w-11 cursor-pointer border-0 bg-transparent text-lg"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(remainingStock || 1, q + 1))}
                aria-label="Shto sasinë"
                className="h-11 w-11 cursor-pointer border-0 bg-transparent text-lg"
              >
                +
              </button>
            </div>
            <button type="button" onClick={handleAddToCart} disabled={remainingStock === 0} className="lib-btn lib-primary px-[22px] py-3">
              {justAdded ? "U shtua ✓" : "Shto në shportë"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleLibraryStatus(opt.value)}
                disabled={libraryLoading}
                className={`lib-btn ${libraryStatus === opt.value ? "lib-primary" : "lib-ghost"} px-4 py-2 text-[13px]`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <h2 className="mt-10 text-[28px]">Vlerësimet</h2>

          {session ? (
            <div ref={reviewFormRef} className="lib-card mt-4 max-w-[560px] p-[22px]">
              <ReviewForm bookId={book._id} existingReview={myReview} onSubmitted={handleSubmittedReview} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              <Link href="/login" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
                Kyçu
              </Link>{" "}
              për të lënë një vlerësim.
            </p>
          )}

          <ul className="mt-8 space-y-4">
            {reviews.length === 0 && <p className="text-sm text-muted">Ende s&apos;ka vlerësime për këtë libër.</p>}
            {reviews.map((review) => {
              const isMine = session ? review.user === session.user.id : false;
              return (
                <li key={review._id} className="lib-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {review.userName}
                      {isMine && (
                        <span className="ml-2 lib-tag" style={{ padding: "2px 10px", fontSize: "10px" }}>
                          Vlerësimi juaj
                        </span>
                      )}
                    </span>
                    <span style={{ color: "var(--gold)" }}>{"⭐".repeat(review.rating)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{review.comment}</p>
                  {isMine && (
                    <div className="mt-2.5 flex gap-4 text-sm">
                      <button type="button" onClick={handleEditReview} className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
                        Ndrysho
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={deletingReviewId === review._id}
                        className="lib-danger"
                      >
                        {deletingReviewId === review._id ? "Duke fshirë…" : "Fshi"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <section className="mt-16 max-w-[74ch]">
        <h2 className="text-[28px]">Përmbledhja</h2>
        <p className="mt-4 whitespace-pre-line leading-[1.75]">{book.summary || book.description}</p>
      </section>

      {relatedBooks.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-[28px]">Libra të ngjashëm</h2>
          <BookGrid books={relatedBooks} />
        </section>
      )}
    </div>
  );
}
