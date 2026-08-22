import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Review from "@/models/Review";
import Order from "@/models/Order";
import type { ReviewDTO } from "@/types/models";

interface DashboardProps {
  libraryCounts: { want: number; reading: number; read: number };
  favoritesCount: number;
  ordersCount: number;
  reviews: ReviewDTO[];
  userName: string;
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/dashboard", permanent: false } };
  }

  await dbConnect();
  const [user, reviews, ordersCount] = await Promise.all([
    User.findById(session.user.id).lean(),
    Review.find({ user: session.user.id }).sort({ createdAt: -1 }).lean(),
    Order.countDocuments({ user: session.user.id }),
  ]);

  const library = user?.library ?? [];
  const libraryCounts = {
    want: library.filter((e) => e.status === "want").length,
    reading: library.filter((e) => e.status === "reading").length,
    read: library.filter((e) => e.status === "read").length,
  };

  return {
    props: {
      libraryCounts,
      favoritesCount: user?.favorites?.length ?? 0,
      ordersCount,
      reviews: JSON.parse(JSON.stringify(reviews)),
      userName: session.user.name ?? "Përdorues",
    },
  };
};

export default function Dashboard({
  libraryCounts,
  favoritesCount,
  ordersCount,
  reviews: initialReviews,
  userName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [reviews, setReviews] = useState(initialReviews);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("A je i sigurt që dëshiron ta fshish këtë koment?")) return;
    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-page py-14">
      <Head>
        <title>Dashboard — Libraria</title>
      </Head>

      <h1 className="text-[clamp(28px,3.8vw,46px)]">Mirë se erdhe, {userName}!</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <StatCard label="Po lexoj" value={libraryCounts.reading} href="/library" />
        <StatCard label="Dua ta lexoj" value={libraryCounts.want} href="/library" />
        <StatCard label="Kam lexuar" value={libraryCounts.read} href="/library" />
        <StatCard label="Të preferuarat" value={favoritesCount} href="/favorites" />
        <StatCard label="Porositë e mia" value={ordersCount} href="/orders" />
        <StatCard label="Vlerësimet e mia" value={reviews.length} />
        <StatCard label="Profili im" value="Menaxho" href="/profile" isLink />
      </div>

      <section className="mt-11">
        <h2 className="text-[28px]">Vlerësimet e mia të fundit</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Nuk ke lënë ende asnjë vlerësim.{" "}
            <Link href="/books" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
              Shfleto librat
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((review) => (
              <li key={review._id} className="lib-card p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/books/${review.book}`} className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
                    Shiko librin
                  </Link>
                  <span style={{ color: "var(--gold)" }}>{"⭐".repeat(review.rating)}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{review.comment}</p>
                <div className="mt-2.5 flex gap-4 text-sm">
                  <Link href={`/books/${review.book}`} className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
                    Ndrysho
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(review._id)}
                    disabled={deletingId === review._id}
                    className="lib-danger"
                  >
                    {deletingId === review._id ? "Duke fshirë…" : "Fshi"}
                  </button>
                </div>
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
    <div className={`lib-card p-8 text-center ${href ? "lib-card-hoverable cursor-pointer" : ""}`}>
      <div className="font-display text-[46px]" style={{ color: "var(--accent)" }}>
        {isLink ? "→" : value}
      </div>
      <div className="text-muted">{label}</div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
