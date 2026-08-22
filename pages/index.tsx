import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import Review from "@/models/Review";
import BookCard from "@/components/BookCard";
import BookGrid from "@/components/BookGrid";
import Button from "@/components/Button";
import type { BookDTO } from "@/types/models";

interface HomeProps {
  featuredBooks: BookDTO[];
  topRatedBooks: BookDTO[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    await dbConnect();
    const books = await Book.find().sort({ createdAt: -1 }).limit(4).lean();

    const topRated = await Review.aggregate([
      { $group: { _id: "$book", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 4 },
    ]);
    const topRatedIds = topRated.map((r) => r._id as mongoose.Types.ObjectId);
    const topRatedBooksRaw = topRatedIds.length
      ? await Book.find({ _id: { $in: topRatedIds } }).lean()
      : [];
    const byId = new Map(topRatedBooksRaw.map((b) => [b._id.toString(), b]));
    const topRatedBooks = topRatedIds.map((id) => byId.get(id.toString())).filter(Boolean);

    return {
      props: {
        featuredBooks: JSON.parse(JSON.stringify(books)),
        topRatedBooks: JSON.parse(JSON.stringify(topRatedBooks)),
      },
      revalidate: 60,
    };
  } catch (error) {
    // Keep the build/deploy from hard-failing if the DB is briefly unreachable;
    // ISR will retry on the next revalidation window.
    console.error("Home getStaticProps failed:", error);
    return { props: { featuredBooks: [], topRatedBooks: [] }, revalidate: 60 };
  }
};

const heroPositions = [
  "left-[2%] top-[5%] -rotate-6",
  "right-[2%] top-0 rotate-[5deg]",
  "left-[29%] bottom-[2%] -rotate-2",
];

export default function Home({ featuredBooks, topRatedBooks }: InferGetStaticPropsType<typeof getStaticProps>) {
  const heroBooks = featuredBooks.slice(0, 3);

  return (
    <div>
      <section className="container-page grid gap-14 py-[74px] pb-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--gold)" }}>
            <span className="h-px w-[26px]" style={{ background: "var(--gold)" }} />
            Dyqani online i librave
          </span>
          <h1 className="mt-5 text-[clamp(38px,5.6vw,78px)] leading-[1.04]">
            Gjeni librin tuaj të radhës në <span style={{ color: "var(--accent)" }}>Libraria</span>
          </h1>
          <p className="mt-[22px] max-w-[46ch] text-lg leading-relaxed text-muted">
            Një dyqan online i thjeshtë me libra nga zhanre të ndryshme — shfletoni, lexoni përshkrime,
            lini vlerësime dhe ruani librat tuaj të preferuar.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3.5">
            <Button href="/books" size="lg">
              Shfleto Librat
            </Button>
            <Button href="/about" size="lg" variant="ghost">
              Mëso më shumë
            </Button>
          </div>
        </div>

        {heroBooks.length > 0 && (
          <div className="relative hidden h-[430px] sm:block">
            <div
              className="absolute inset-[4%_0]"
              style={{ background: "radial-gradient(circle at 55% 45%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 70%)" }}
            />
            {heroBooks.map((book, i) => (
              <div
                key={book._id}
                className={`absolute aspect-[3/4] w-[44%] overflow-hidden rounded-2xl shadow-[0_22px_54px_rgba(31,42,36,.4)] ${heroPositions[i]}`}
              >
                <Image src={book.coverImage} alt={`Kapaku i librit ${book.title}`} fill sizes="30vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container-page py-10">
        <div className="mb-7 flex items-baseline justify-between">
          <h2 className="text-[clamp(26px,3.4vw,42px)]">Librat më të fundit</h2>
          <Link href="/books" className="lib-link text-sm font-semibold" style={{ color: "var(--accent)" }}>
            Shiko të gjitha →
          </Link>
        </div>

        {featuredBooks.length === 0 ? (
          <p className="text-muted">
            Ende nuk ka libra. Admini mund t&apos;i shtojë ata nga paneli i administrimit.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {topRatedBooks.length > 0 && (
        <section className="container-page py-10">
          <div className="mb-7 flex items-baseline justify-between">
            <h2 className="text-[clamp(26px,3.4vw,42px)]">Më të vlerësuarit</h2>
          </div>
          <BookGrid books={topRatedBooks} />
        </section>
      )}

      <section className="container-page grid gap-8 py-16 sm:grid-cols-3">
        <Feature
          title="Gjerësi zhanresh"
          text="Fiction, sci-fi, histori, biznes e shumë më tepër — të gjitha në një vend."
          icon={
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          }
        />
        <Feature
          title="Të preferuarat"
          text="Ruaj librat që të pëlqejnë dhe kthehu tek ata kur të kesh kohë të lexosh."
          icon={<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />}
        />
        <Feature
          title="Vlerësime"
          text="Lexo dhe shkruaj vlerësime për çdo libër përpara se të vendosësh."
          icon={
            <path d="M11.5 3.3a.6.6 0 0 1 1 0l2.3 4.7 5.2.7a.6.6 0 0 1 .3 1l-3.7 3.7.9 5.1a.6.6 0 0 1-.9.6L12 16.5l-4.6 2.4a.6.6 0 0 1-.9-.6l.9-5.1L3.7 9.7a.6.6 0 0 1 .3-1l5.2-.7z" />
          }
        />
      </section>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="grid h-[52px] w-[52px] place-items-center rounded-full bg-accent-soft text-accent">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {icon}
        </svg>
      </span>
      <h3 className="text-[22px]">{title}</h3>
      <p className="text-[15px] leading-relaxed text-muted">{text}</p>
    </div>
  );
}
