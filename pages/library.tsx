import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import mongoose from "mongoose";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import type { IBook } from "@/models/Book";
import BookGrid from "@/components/BookGrid";
import type { BookDTO, LibraryStatus } from "@/types/models";

interface LibraryProps {
  want: BookDTO[];
  reading: BookDTO[];
  read: BookDTO[];
  favoriteIds: string[];
}

export const getServerSideProps: GetServerSideProps<LibraryProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/library", permanent: false } };
  }

  await dbConnect();
  const user = (await User.findById(session.user.id)
    .populate("library.book")
    .lean()) as unknown as {
    library: { book: IBook; status: LibraryStatus }[];
    favorites: mongoose.Types.ObjectId[];
  } | null;

  const entries = (user?.library ?? []).filter((entry) => entry.book);
  const byStatus = (status: LibraryStatus) =>
    entries.filter((e) => e.status === status).map((e) => e.book);

  return {
    props: {
      want: JSON.parse(JSON.stringify(byStatus("want"))),
      reading: JSON.parse(JSON.stringify(byStatus("reading"))),
      read: JSON.parse(JSON.stringify(byStatus("read"))),
      favoriteIds: (user?.favorites ?? []).map((id) => id.toString()),
    },
  };
};

export default function Library({ want, reading, read, favoriteIds }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isEmpty = want.length === 0 && reading.length === 0 && read.length === 0;
  const favorites = new Set(favoriteIds);

  return (
    <div className="container-page py-14">
      <Head>
        <title>Librat e mi — Libraria</title>
      </Head>

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[clamp(30px,4vw,48px)]">Librat e mi</h1>
        <Link href="/favorites" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
          Shiko të preferuarat →
        </Link>
      </div>

      {isEmpty ? (
        <p className="mt-6 text-muted">
          Ende s&apos;ke shtuar asnjë libër në listën tënde.{" "}
          <Link href="/books" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
            Shfleto librat
          </Link>
          .
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-12">
          <LibrarySection title="Po lexoj" books={reading} statuses={reading.map(() => "reading" as const)} favorites={favorites} />
          <LibrarySection title="Dua ta lexoj" books={want} statuses={want.map(() => "want" as const)} favorites={favorites} />
          <LibrarySection title="E lexuar" books={read} statuses={read.map(() => "read" as const)} favorites={favorites} />
        </div>
      )}
    </div>
  );
}

function LibrarySection({
  title,
  books,
  statuses,
  favorites,
}: {
  title: string;
  books: BookDTO[];
  statuses: LibraryStatus[];
  favorites: Set<string>;
}) {
  if (books.length === 0) return null;
  const libraryStatuses = Object.fromEntries(books.map((b, i) => [b._id, statuses[i]]));

  return (
    <section>
      <h2 className="mb-5 flex items-baseline gap-2 text-[24px]">
        {title} <span className="text-base font-normal text-muted">({books.length})</span>
      </h2>
      <BookGrid books={books} libraryStatuses={libraryStatuses} favoriteIds={favorites} />
    </section>
  );
}
