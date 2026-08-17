import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Review from "@/models/Review";
import type { ReviewDTO } from "@/types/models";

interface DashboardProps {
  favoritesCount: number;
  reviews: ReviewDTO[];
  userName: string;
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/dashboard", permanent: false } };
  }

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  const reviews = await Review.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

  return {
    props: {
      favoritesCount: user?.favorites?.length ?? 0,
      reviews: JSON.parse(JSON.stringify(reviews)),
      userName: session.user.name ?? "Përdorues",
    },
  };
};

export default function Dashboard({
  favoritesCount,
  reviews,
  userName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="container-page py-12">
      <Head>
        <title>Dashboard — Libraria</title>
      </Head>

      <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">Mirë se erdhe, {userName}!</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <StatCard label="Të preferuarat" value={favoritesCount} href="/favorites" />
        <StatCard label="Vlerësimet e mia" value={reviews.length} />
        <StatCard label="Profili im" value="Menaxho" href="/profile" isLink />
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-gray-100">Vlerësimet e mia të fundit</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Nuk ke lënë ende asnjë vlerësim.{" "}
            <Link href="/books" className="text-brand-600 hover:underline dark:text-brand-400">
              Shfleto librat
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((review) => (
              <li key={review._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Link href={`/books/${review.book}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                    Shiko librin
                  </Link>
                  <span className="text-yellow-600 dark:text-yellow-400">{"⭐".repeat(review.rating)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  isLink,
}: {
  label: string;
  value: number | string;
  href?: string;
  isLink?: boolean;
}) {
  const content = (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{isLink ? "→" : value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
