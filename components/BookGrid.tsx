import BookCard from "@/components/BookCard";
import type { BookDTO, LibraryStatus } from "@/types/models";

interface BookGridProps {
  books: BookDTO[];
  libraryStatuses?: Record<string, LibraryStatus>;
  favoriteIds?: Set<string> | string[];
}

export default function BookGrid({ books, libraryStatuses, favoriteIds }: BookGridProps) {
  const favorites = favoriteIds instanceof Set ? favoriteIds : new Set(favoriteIds ?? []);

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard
          key={book._id}
          book={book}
          initialLibraryStatus={libraryStatuses?.[book._id] ?? null}
          initialFavorite={favorites.has(book._id)}
        />
      ))}
    </div>
  );
}
