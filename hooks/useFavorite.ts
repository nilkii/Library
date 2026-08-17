import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/** Tracks and toggles whether a book is in the current user's favorites list. */
export function useFavorite(bookId: string, initialFavorited: boolean) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  // `initialFavorited` often starts false and flips true once the parent page
  // finishes fetching the user's favorites list asynchronously — pick that up.
  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  const toggleFavorite = async () => {
    if (!session) {
      window.location.href = `/login?callbackUrl=/books/${bookId}`;
      return;
    }

    setLoading(true);
    const previous = favorited;
    setFavorited(!previous);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setFavorited(data.favorited);
    } catch {
      setFavorited(previous);
    } finally {
      setLoading(false);
    }
  };

  return { favorited, toggleFavorite, loading, isLoggedIn: Boolean(session) };
}
