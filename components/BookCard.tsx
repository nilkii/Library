import Image from "next/image";
import Link from "next/link";
import type { BookDTO, LibraryStatus } from "@/types/models";
import { useLibraryStatus } from "@/hooks/useLibraryStatus";
import { useFavorite } from "@/hooks/useFavorite";

interface BookCardProps {
  book: BookDTO;
  initialLibraryStatus?: LibraryStatus | null;
  initialFavorite?: boolean;
}

export default function BookCard({ book, initialLibraryStatus = null, initialFavorite = false }: BookCardProps) {
  const { status, toggle, loading } = useLibraryStatus(book._id, initialLibraryStatus);
  const { isFavorite, toggle: toggleFavorite, loading: favoriteLoading } = useFavorite(book._id, initialFavorite);
  const wanted = status === "want";

  return (
    <div className="lib-card lib-card-hoverable group relative flex flex-col">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite();
        }}
        disabled={favoriteLoading}
        aria-label={isFavorite ? "Hiq nga të preferuarat" : "Shto te të preferuarat"}
        aria-pressed={isFavorite}
        className="lib-star"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill={isFavorite ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M11.5 2.6a.6.6 0 0 1 1 0l2.6 5.3 5.8.8a.6.6 0 0 1 .3 1l-4.2 4.1 1 5.8a.6.6 0 0 1-.9.6L12 17.5l-5.2 2.7a.6.6 0 0 1-.9-.6l1-5.8-4.2-4.1a.6.6 0 0 1 .3-1l5.8-.8z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle("want");
        }}
        disabled={loading}
        aria-label={wanted ? "Hiq nga listë-leximi" : "Dua ta lexoj"}
        aria-pressed={wanted}
        className="lib-heart"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill={wanted ? "#fff" : "none"} stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
      </button>

      <Link href={`/books/${book._id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <Image
            src={book.coverImage}
            alt={`Kapaku i librit ${book.title}`}
            fill
            sizes="(min-width: 1024px) 240px, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
          <span
            className="absolute left-[14px] top-3 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--gold)" }}
          >
            {book.genre}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-[18px] pb-[18px] pt-[15px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{book.title}</span>
              <span className="text-xs text-muted">{book.author}</span>
            </div>
            <span className="font-display shrink-0 text-[19px]">€{book.price.toFixed(2)}</span>
          </div>
          <span className={`mt-1 text-xs font-medium ${book.stock > 0 ? "" : "text-red-500"}`} style={book.stock > 0 ? { color: "var(--ok)" } : undefined}>
            {book.stock > 0 ? "Në stok" : "Pa stok"}
          </span>
        </div>
      </Link>
    </div>
  );
}
