import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const accountLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/library", label: "Librat e mi" },
  { href: "/favorites", label: "Të preferuarat" },
  { href: "/profile", label: "Profili" },
];

function LogoMark() {
  return (
    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-accent">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    </span>
  );
}

function CartLink({ onClick }: { onClick?: () => void }) {
  const { itemCount } = useCart();
  return (
    <Link href="/cart" onClick={onClick} aria-label="Shporta" className="lib-btn lib-ghost relative h-10 w-10 rounded-full p-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 2.5h2l2.4 12.6a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 6H6" />
      </svg>
      {itemCount > 0 && (
        <span
          className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold text-accent-ink"
          style={{ background: "var(--gold)" }}
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}

function AccountMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const firstName = name.split(" ")[0] || "Llogaria";
  const initial = (name.trim()[0] ?? "?").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="lib-btn lib-ghost gap-2 py-2 pl-2.5 pr-3.5"
      >
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          aria-hidden
        >
          {initial}
        </span>
        <span className="max-w-[120px] truncate">{firstName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .15s" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 18px 44px rgba(0,0,0,.18)" }}
        >
          <div className="flex flex-col py-1.5">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="lib-link px-4 py-2.5 text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line)" }}>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full cursor-pointer bg-transparent px-4 py-2.5 text-left text-sm font-semibold"
              style={{ color: "#c0503a" }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = session?.user.role === "admin";

  const isActive = (href: string) => (href === "/" ? router.pathname === "/" : router.pathname.startsWith(href));

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-[14px]"
      style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 82%, transparent)" }}
    >
      <div className="container-page flex h-16 items-center gap-8">
        <Link href="/" className="font-display mr-auto inline-flex items-center gap-[11px] text-[22px]">
          <LogoMark />
          Libraria
        </Link>

        <nav className="hidden items-center gap-6 text-[15px] md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="lib-link"
              style={{ color: isActive(link.href) ? "var(--accent)" : "var(--text)", fontWeight: isActive(link.href) ? 600 : 400 }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 text-[15px] md:flex">
          <ThemeToggle />
          <CartLink />
          {status === "authenticated" ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="lib-btn lib-secondary px-4 py-2 text-[13px]">
                  Paneli i Adminit
                </Link>
              )}
              <AccountMenu name={session.user.name ?? "Përdorues"} />
            </>
          ) : status === "unauthenticated" ? (
            <>
              <Link href="/login" className="lib-link" style={{ color: "var(--muted)" }}>
                Login
              </Link>
              <Link href="/register" className="lib-btn lib-primary px-[22px] py-2.5">
                Register
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CartLink />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Hap menunë"
            aria-expanded={menuOpen}
          >
            <span aria-hidden className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t px-4 pb-4 md:hidden" style={{ borderColor: "var(--line)" }}>
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium">
                {link.label}
              </Link>
            ))}

            {status === "authenticated" ? (
              <>
                <div className="mt-1 border-t pt-3" style={{ borderColor: "var(--line)" }}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.09em] text-muted">
                    {session.user.name ?? "Llogaria"}
                  </p>
                  <div className="flex flex-col gap-3">
                    {accountLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium">
                        {link.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="lib-btn lib-secondary w-fit px-4 py-2 text-[13px]"
                      >
                        Paneli i Adminit
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="border-t pt-3 text-left text-sm font-semibold"
                  style={{ borderColor: "var(--line)", color: "#c0503a" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="text-sm font-medium">
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
