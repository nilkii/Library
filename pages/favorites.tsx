import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import type { IBook } from "@/models/Book";
import BookGrid from "@/components/BookGrid";
import type { BookDTO } from "@/types/models";

interface FavoritesProps {
  books: BookDTO[];
}

export const getServerSideProps: GetServerSideProps<FavoritesProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/favorites", permanent: false } };
  }

  await dbConnect();
  const user = (await User.findById(session.user.id)
    .populate("favorites")
    .lean()) as unknown as { favorites: IBook[] } | null;

  const books = (user?.favorites ?? []).filter(Boolean);

  return {
    props: {
      books: JSON.parse(JSON.stringify(books)),
    },
  };
};

export default function Favorites({ books }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="container-page py-14">
      <Head>
        <title>Të preferuarat — Libraria</title>
      </Head>

      <h1 className="text-[clamp(30px,4vw,48px)]">Librat e mi të preferuar</h1>
      <p className="mt-2.5 text-muted">
        Librat që ke shënuar me yll. Kjo listë është e ndarë nga &quot;Dua ta lexoj&quot; te{" "}
        <Link href="/library" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
          Librat e mi
        </Link>
        .
      </p>

      {books.length === 0 ? (
        <p className="mt-6 text-muted">
          Ende s&apos;ke shtuar asnjë libër te të preferuarat.{" "}
          <Link href="/books" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
            Shfleto librat
          </Link>
          .
        </p>
      ) : (
        <div className="mt-9">
          <BookGrid books={books} favoriteIds={books.map((b) => b._id)} />
        </div>
      )}
    </div>
  );
}
