import type { GetStaticProps } from "next";
import Head from "next/head";

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} };
};

const team = [
  {
    name: "Anila",
    role: "Full-stack Development",
    bio: "Autentifikimi & rolet, modelet & API routes, paneli i adminit, CRUD i librave, deployment & CI/CD.",
  },
  {
    name: "Anesa",
    role: "Frontend & UI/UX",
    bio: "Faqet statike (Home, About, Contact), faqja e Profilit, Dark/Light Mode, dhe testimi i komponentëve.",
  },
];

export default function About() {
  return (
    <div className="container-page py-16">
      <Head>
        <title>About — Libraria</title>
      </Head>

      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
          Rreth Libraria
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Libraria është një projekt semestral për lëndën <em>Zhvillim i Ueb-it në Anën e Klientit</em>.
          Qëllimi ynë ishte të ndërtojmë një dyqan online funksional librash, duke përdorur Next.js,
          MongoDB, NextAuth dhe Tailwind CSS — nga autentifikimi dhe menaxhimi i roleve, deri te CRUD
          i plotë, data fetching me SSR/SSG/ISR, dhe një ndërfaqe plotësisht responsive.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {team.map((member) => (
          <div
            key={member.name}
            className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              {member.name.charAt(0)}
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h2>
            <p className="text-sm font-medium text-brand-600 dark:text-brand-400">{member.role}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{member.bio}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Teknologjitë e përdorura</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Next.js (Pages Router) · TypeScript · Tailwind CSS · NextAuth.js · MongoDB &amp; Mongoose ·
          react-hook-form · Jest &amp; React Testing Library · GitHub Actions
        </p>
      </div>
    </div>
  );
}
