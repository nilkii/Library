import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import type { IBook } from "@/models/Book";
import BookCard from "@/components/BookCard";
import type { BookDTO } from "@/types/models";

export const getServerSideProps: GetServerSideProps<{ books: BookDTO[] }> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/favorites", permanent: false } };
  }

  await dbConnect();
  const user = (await User.findById(session.user.id)
    .populate("favorites")
    .lean()) as unknown as { favorites: IBook[] } | null;

  return {
    props: {
      books: JSON.parse(JSON.stringify(user?.favorites ?? [])),
    },
  };
};

export default function Favorites({ books }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="container-page py-12">
      <Head>
        <title>Favorites — Libraria</title>
      </Head>

      <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">Të preferuarat e mia</h1>

      {books.length === 0 ? (
        <p className="mt-6 text-gray-500 dark:text-gray-400">
          Nuk ke shtuar ende asnjë libër te të preferuarat.{" "}
          <Link href="/books" className="text-brand-600 hover:underline dark:text-brand-400">
            Shfleto librat
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book._id} book={book} initialFavorited />
          ))}
        </div>
      )}
    </div>
  );
}
