import { useEffect, useState } from "react";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import BookGrid from "@/components/BookGrid";
import { useDebounce } from "@/hooks/useDebounce";
import type { BookDTO, LibraryEntryDTO, LibraryStatus } from "@/types/models";

export const getStaticProps: GetStaticProps<{ initialBooks: BookDTO[]; genres: string[] }> = async () => {
  try {
    await dbConnect();
    const books = await Book.find().sort({ createdAt: -1 }).lean();
    const genres = Array.from(new Set(books.map((b) => b.genre))).sort();

    return {
      props: {
        initialBooks: JSON.parse(JSON.stringify(books)),
        genres,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Books getStaticProps failed:", error);
    return { props: { initialBooks: [], genres: [] }, revalidate: 60 };
  }
};

const SORT_OPTIONS = [
  { value: "newest", label: "Më i ri" },
  { value: "price_asc", label: "Çmimi: e ulët → e lartë" },
  { value: "price_desc", label: "Çmimi: e lartë → e ulët" },
  { value: "title_asc", label: "Titulli: A → Z" },
];

export default function BooksPage({
  initialBooks,
  genres,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("newest");
  const [books, setBooks] = useState<BookDTO[]>(initialBooks);
  const [loading, setLoading] = useState(false);
  const [libraryStatuses, setLibraryStatuses] = useState<Record<string, LibraryStatus>>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("search", debouncedQuery);
    if (genre !== "all") params.set("genre", genre);
    params.set("sort", sort);

    setLoading(true);
    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data: BookDTO[]) => setBooks(data))
      .catch(() => setBooks(initialBooks))
      .finally(() => setLoading(false));
  }, [debouncedQuery, genre, sort, initialBooks]);

  useEffect(() => {
    if (!session) {
      setLibraryStatuses({});
      setFavoriteIds(new Set());
      return;
    }
    fetch("/api/library")
      .then((res) => res.json())
      .then((entries: LibraryEntryDTO[]) =>
        setLibraryStatuses(Object.fromEntries(entries.map((e) => [e.book._id, e.status])))
      )
      .catch(() => setLibraryStatuses({}));
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((books: BookDTO[]) => setFavoriteIds(new Set(books.map((b) => b._id))))
      .catch(() => setFavoriteIds(new Set()));
  }, [session]);

  return (
    <div className="container-page py-12">
      <Head>
        <title>Books — Libraria</title>
      </Head>

      <h1 className="text-[clamp(32px,4.4vw,52px)]">Të gjithë librat</h1>

      <div className="mt-7 flex flex-wrap gap-3.5">
        <div className="relative min-w-[240px] flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Kërko sipas titullit ose autorit…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="lib-input pl-[44px]"
          />
        </div>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="lib-input w-auto min-w-[190px] cursor-pointer sm:w-52"
        >
          <option value="all">Të gjitha zhanret</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="lib-input w-auto min-w-[190px] cursor-pointer sm:w-64"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-9">
        {loading ? (
          <p className="text-muted">Duke kërkuar...</p>
        ) : books.length === 0 ? (
          <p className="text-muted">Nuk u gjet asnjë libër.</p>
        ) : (
          <BookGrid books={books} libraryStatuses={libraryStatuses} favoriteIds={favoriteIds} />
        )}
      </div>
    </div>
  );
}
