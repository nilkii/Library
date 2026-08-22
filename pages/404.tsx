import Head from "next/head";
import Button from "@/components/Button";

export default function Custom404() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <Head>
        <title>404 — Libraria</title>
      </Head>
      <span className="grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </span>
      <h1 className="mt-5 text-3xl">404 — Faqja nuk u gjet</h1>
      <p className="mt-2 max-w-md text-muted">Faqja që po kërkoni nuk ekziston ose është zhvendosur.</p>
      <Button href="/" className="mt-6">
        Kthehu në Home
      </Button>
    </div>
  );
}
