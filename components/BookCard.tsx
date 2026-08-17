import Image from "next/image";
import Link from "next/link";
import type { BookDTO } from "@/types/models";
import { useFavorite } from "@/hooks/useFavorite";

interface BookCardProps {
  book: BookDTO;
  initialFavorited?: boolean;
}

export default function BookCard({ book, initialFavorited = false }: BookCardProps) {
  const { favorited, toggleFavorite, loading } = useFavorite(book._id, initialFavorited);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite();
        }}
        disabled={loading}
        aria-label={favorited ? "Hiq nga të preferuarat" : "Shto te të preferuarat"}
        aria-pressed={favorited}
        className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow dark:bg-gray-900/90"
      >
        <span aria-hidden>{favorited ? "❤️" : "🤍"}</span>
      </button>

      <Link href={`/books/${book._id}`} className="flex flex-1 flex-col">
        <div className="relative h-56 w-full bg-gray-100 dark:bg-gray-800">
          <Image
            src={book.coverImage}
            alt={`Kapaku i librit ${book.title}`}
            fill
            sizes="(min-width: 1024px) 240px, 45vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {book.genre}
          </span>
          <h3 className="line-clamp-2 font-serif text-lg font-semibold text-gray-900 dark:text-gray-100">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              €{book.price.toFixed(2)}
            </span>
            <span
              className={`text-xs ${book.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
            >
              {book.stock > 0 ? "Në stok" : "Pa stok"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
