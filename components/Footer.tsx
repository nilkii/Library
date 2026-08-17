import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-bold text-brand-700 dark:text-brand-300">📚 Libraria</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Dyqani juaj online për libra — thjeshtë, i shpejtë, i besueshëm.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Faqet</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/" className="hover:text-brand-600">Home</Link></li>
            <li><Link href="/books" className="hover:text-brand-600">Books</Link></li>
            <li><Link href="/about" className="hover:text-brand-600">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Llogaria</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/login" className="hover:text-brand-600">Login</Link></li>
            <li><Link href="/register" className="hover:text-brand-600">Register</Link></li>
            <li><Link href="/favorites" className="hover:text-brand-600">Favorites</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Projekt</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Zhvillim i Ueb-it në Anën e Klientit — Projekt Semestral
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Anila &amp; Anesa</p>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        © {year} Libraria. Të gjitha të drejtat e rezervuara.
      </div>
    </footer>
  );
}
