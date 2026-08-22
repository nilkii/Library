import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display inline-flex items-center gap-2.5 text-[23px]">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-accent">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            Libraria
          </p>
          <p className="mt-3.5 max-w-[30ch] text-sm leading-relaxed text-muted">
            Dyqani juaj online për libra — thjeshtë, i shpejtë, i besueshëm.
          </p>
        </div>

        <div>
          <h4 className="mb-3.5 text-[13px] uppercase tracking-[0.06em] text-muted">Faqet</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="lib-link">Home</Link>
            <Link href="/books" className="lib-link">Books</Link>
            <Link href="/about" className="lib-link">About</Link>
            <Link href="/contact" className="lib-link">Contact</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3.5 text-[13px] uppercase tracking-[0.06em] text-muted">Llogaria</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/login" className="lib-link">Login</Link>
            <Link href="/register" className="lib-link">Register</Link>
            <Link href="/library" className="lib-link">Librat e mi</Link>
            <Link href="/orders" className="lib-link">Porositë e mia</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3.5 text-[13px] uppercase tracking-[0.06em] text-muted">Projekt</h4>
          <p className="text-sm leading-relaxed text-muted">
            Zhvillim i Ueb-it në Anën e Klientit — Projekt Semestral
            <br />
            Anila &amp; Anesa
          </p>
        </div>
      </div>

      <div className="border-t py-[18px] text-center text-[13px] text-muted" style={{ borderColor: "var(--line)" }}>
        © {year} Libraria. Të gjitha të drejtat e rezervuara.
      </div>
    </footer>
  );
}
