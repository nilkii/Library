import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import type { OrderDTO, OrderStatus } from "@/types/models";

export const getServerSideProps: GetServerSideProps<{ orders: OrderDTO[] }> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/orders", permanent: false } };
  }

  await dbConnect();
  const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

  return { props: { orders: JSON.parse(JSON.stringify(orders)) } };
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Në pritje",
  fulfilled: "Dërguar",
  cancelled: "Anuluar",
};

export default function Orders({ orders }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="container-page py-14">
      <Head>
        <title>Porositë e mia — Libraria</title>
      </Head>

      <h1 className="text-[clamp(30px,4vw,48px)]">Porositë e mia</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-muted">
          Ende s&apos;ke bërë asnjë porosi.{" "}
          <Link href="/books" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
            Shfleto librat
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order._id}>
              <Link href={`/orders/${order._id}`} className="lib-card lib-card-hoverable flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold">Porosia #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-muted">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} artikuj
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="lib-tag">{STATUS_LABELS[order.status]}</span>
                  <span className="font-display text-xl">€{order.total.toFixed(2)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
