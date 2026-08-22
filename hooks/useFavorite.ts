import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/** Tracks and toggles whether a book is in the current user's favorites. */
export function useFavorite(bookId: string, initialFavorite: boolean) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  const toggle = async () => {
    if (!session) {
      window.location.href = `/login?callbackUrl=/books/${bookId}`;
      return;
    }

    setLoading(true);
    const previous = isFavorite;
    setIsFavorite(!previous);

    try {
      const res = await fetch("/api/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setIsFavorite(data.favorite);
    } catch {
      setIsFavorite(previous);
    } finally {
      setLoading(false);
    }
  };

  return { isFavorite, toggle, loading };
}
