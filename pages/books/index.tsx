import { useEffect, useState } from "react";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import BookCard from "@/components/BookCard";
import { useDebounce } from "@/hooks/useDebounce";
import type { BookDTO } from "@/types/models";

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

export default function BooksPage({
  initialBooks,
  genres,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [books, setBooks] = useState<BookDTO[]>(initialBooks);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("search", debouncedQuery);
    if (genre !== "all") params.set("genre", genre);

    setLoading(true);
    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data: BookDTO[]) => setBooks(data))
      .catch(() => setBooks(initialBooks))
      .finally(() => setLoading(false));
  }, [debouncedQuery, genre, initialBooks]);

  useEffect(() => {
    if (!session) {
      setFavoriteIds(new Set());
      return;
    }
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((favs: { _id: string }[]) => setFavoriteIds(new Set(favs.map((f) => f._id))))
      .catch(() => setFavoriteIds(new Set()));
  }, [session]);

  return (
    <div className="container-page py-12">
      <Head>
        <title>Books — Libraria</title>
      </Head>

      <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">Të gjithë librat</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Kërko sipas titullit ose autorit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:w-56"
        >
          <option value="all">Të gjitha zhanret</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Duke kërkuar...</p>
        ) : books.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Nuk u gjet asnjë libër.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book._id} book={book} initialFavorited={favoriteIds.has(book._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
