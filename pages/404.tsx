import Head from "next/head";
import Button from "@/components/Button";

export default function Custom404() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <Head>
        <title>404 — Libraria</title>
      </Head>
      <p className="text-6xl">📖</p>
      <h1 className="mt-4 font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">
        404 — Faqja nuk u gjet
      </h1>
      <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
        Faqja që po kërkoni nuk ekziston ose është zhvendosur.
      </p>
      <Button href="/" className="mt-6">
        Kthehu në Home
      </Button>
    </div>
  );
}
