import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import type { OrderDTO, OrderStatus } from "@/types/models";

export const getServerSideProps: GetServerSideProps<{ order: OrderDTO }> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const id = context.params?.id as string;
  await dbConnect();
  const order = await Order.findById(id).lean().catch(() => null);

  if (!order) return { notFound: true };
  if (order.user.toString() !== session.user.id && session.user.role !== "admin") {
    return { redirect: { destination: "/orders", permanent: false } };
  }

  return { props: { order: JSON.parse(JSON.stringify(order)) } };
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Në pritje",
  fulfilled: "Dërguar",
  cancelled: "Anuluar",
};

export default function OrderDetails({ order }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="container-page max-w-2xl py-14">
      <Head>
        <title>Porosia #{order._id.slice(-6).toUpperCase()} — Libraria</title>
      </Head>

      <span className="lib-tag">{STATUS_LABELS[order.status]}</span>
      <h1 className="mt-3.5 text-[clamp(28px,4vw,44px)]">Porosia #{order._id.slice(-6).toUpperCase()}</h1>
      <p className="mt-1.5 text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</p>

      <div className="lib-card mt-8 p-7">
        <h2 className="text-lg font-semibold">Artikujt</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.book} className="flex items-center justify-between text-sm">
              <span>
                {item.title} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--line)" }}>
          <span className="font-semibold">Totali</span>
          <span className="font-display text-2xl">€{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="lib-card mt-6 p-7">
        <h2 className="text-lg font-semibold">Dërgesa</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.address}, {order.shippingAddress.city}
          <br />
          {order.shippingAddress.phone}
        </p>
        <p className="mt-3 text-xs text-muted">Pagesa: Cash on Delivery.</p>
      </div>
    </div>
  );
}
