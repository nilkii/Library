import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? router.pathname === "/" : router.pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold text-brand-700 dark:text-brand-300">
          📚 Libraria
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                isActive(link.href)
                  ? "text-brand-700 dark:text-brand-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {status === "authenticated" ? (
            <>
              <Link href="/favorites" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">
                Favorites
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">
                Dashboard
              </Link>
              {session.user.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">
                {session.user.name?.split(" ")[0] ?? "Profile"}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Register
              </Link>
            </>
          ) : null}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Hap menunë"
          aria-expanded={menuOpen}
        >
          <span aria-hidden className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 px-4 pb-4 md:hidden dark:border-gray-800">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {link.label}
              </Link>
            ))}
            {status === "authenticated" ? (
              <>
                <Link href="/favorites" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Favorites
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Dashboard
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Admin
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Register
                </Link>
              </>
            )}
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
