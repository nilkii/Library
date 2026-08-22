import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { LibraryStatus } from "@/types/models";

/** Tracks and updates a book's reading-list status for the current user. */
export function useLibraryStatus(bookId: string, initialStatus: LibraryStatus | null) {
  const { data: session } = useSession();
  const [status, setStatusState] = useState<LibraryStatus | null>(initialStatus);
  const [loading, setLoading] = useState(false);

  // `initialStatus` often starts null and resolves once the parent page finishes
  // fetching the user's library asynchronously — pick that up.
  useEffect(() => {
    setStatusState(initialStatus);
  }, [initialStatus]);

  const setStatus = async (next: LibraryStatus | null) => {
    if (!session) {
      window.location.href = `/login?callbackUrl=/books/${bookId}`;
      return;
    }

    setLoading(true);
    const previous = status;
    setStatusState(next);

    try {
      const res = await fetch("/api/library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, status: next }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setStatusState(data.status);
    } catch {
      setStatusState(previous);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (target: LibraryStatus) => setStatus(status === target ? null : target);

  return { status, setStatus, toggle, loading, isLoggedIn: Boolean(session) };
}
