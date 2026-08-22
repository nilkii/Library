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

const tech = ["Next.js", "TypeScript", "Tailwind CSS", "NextAuth.js", "MongoDB", "react-hook-form", "Jest", "GitHub Actions"];

export default function About() {
  return (
    <div className="container-page py-16">
      <Head>
        <title>About — Libraria</title>
      </Head>

      <div className="mx-auto max-w-[860px] pt-4 text-center">
        <h1 className="text-[clamp(32px,4.6vw,56px)]">Rreth Libraria</h1>
        <p className="mx-auto mt-6 max-w-[62ch] text-[17px] leading-[1.75] text-muted">
          Libraria është një projekt semestral për lëndën <em>Zhvillim i Ueb-it në Anën e Klientit</em>.
          Qëllimi ynë ishte të ndërtojmë një dyqan online funksional librash — nga autentifikimi dhe
          menaxhimi i roleve, deri te CRUD i plotë, data fetching dhe një ndërfaqe plotësisht responsive.
        </p>

        <div className="mt-11 grid gap-6 sm:grid-cols-2">
          {team.map((member) => (
            <div key={member.name} className="lib-card flex flex-col items-center gap-1.5 p-8">
              <span className="font-display grid h-[74px] w-[74px] place-items-center rounded-full bg-accent text-[32px] text-accent-ink">
                {member.name.charAt(0)}
              </span>
              <span className="font-display mt-2 text-2xl">{member.name}</span>
              <span className="font-semibold" style={{ color: "var(--gold)" }}>{member.role}</span>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{member.bio}</p>
            </div>
          ))}
        </div>

        <div className="lib-card mt-6 p-7 text-left">
          <h3 className="mb-3.5 text-[22px]">Teknologjitë e përdorura</h3>
          <div className="flex flex-wrap gap-2.5">
            {tech.map((t) => (
              <span key={t} className="lib-tag" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
