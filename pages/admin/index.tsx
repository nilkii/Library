import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import ContactMessage from "@/models/ContactMessage";
import Order from "@/models/Order";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import BookFormModal from "@/components/BookFormModal";
import type { BookDTO, ContactMessageDTO, OrderStatus, OrderSummaryDTO } from "@/types/models";

interface AdminProps {
  books: BookDTO[];
  messages: ContactMessageDTO[];
  orders: OrderSummaryDTO[];
}

export const getServerSideProps: GetServerSideProps<AdminProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/admin", permanent: false } };
  }
  if (session.user.role !== "admin") {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  await dbConnect();
  const [books, messages, ordersRaw] = await Promise.all([
    Book.find().sort({ createdAt: -1 }).lean(),
    ContactMessage.find().sort({ createdAt: -1 }).limit(20).lean(),
    Order.find().sort({ createdAt: -1 }).populate("user", "name email").lean(),
  ]);

  const orders = ordersRaw.map((order) => {
    const user = order.user as unknown as { name?: string; email?: string; _id: unknown };
    return { ...order, user: user?._id, userName: user?.name, userEmail: user?.email };
  });

  return {
    props: {
      books: JSON.parse(JSON.stringify(books)),
      messages: JSON.parse(JSON.stringify(messages)),
      orders: JSON.parse(JSON.stringify(orders)),
    },
  };
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Në pritje",
  fulfilled: "Dërguar",
  cancelled: "Anuluar",
};

export default function AdminPanel({
  books: initialBooks,
  messages,
  orders: initialOrders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [books, setBooks] = useState(initialBooks);
  const [orders, setOrders] = useState(initialOrders);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDTO | null>(null);
  const [deletingBook, setDeletingBook] = useState<BookDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<OrderSummaryDTO | null>(null);

  const openCreate = () => {
    setEditingBook(null);
    setFormOpen(true);
  };

  const openEdit = (book: BookDTO) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleSaved = (book: BookDTO) => {
    setBooks((prev) => {
      const index = prev.findIndex((b) => b._id === book._id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = book;
        return copy;
      }
      return [book, ...prev];
    });
  };

  const confirmDelete = async () => {
    if (!deletingBook) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${deletingBook._id}`, { method: "DELETE" });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b._id !== deletingBook._id));
      }
    } finally {
      setDeleting(false);
      setDeletingBook(null);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
      setViewingOrder((prev) => (prev && prev._id === orderId ? { ...prev, status } : prev));
    }
  };

  return (
    <div className="container-page py-14">
      <Head>
        <title>Admin Panel — Libraria</title>
      </Head>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[clamp(28px,3.8vw,46px)]">Paneli i Adminit</h1>
        <Button onClick={openCreate}>+ Shto libër</Button>
      </div>

      <section className="lib-card mt-7 overflow-x-auto p-1.5">
        <table className="lib-table min-w-[640px]">
          <thead>
            <tr>
              <th>Titulli</th>
              <th>Autori</th>
              <th>Zhanri</th>
              <th>Çmimi</th>
              <th>Stoku</th>
              <th className="text-right">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td className="font-semibold">{book.title}</td>
                <td className="text-muted">{book.author}</td>
                <td className="text-muted">{book.genre}</td>
                <td>€{book.price.toFixed(2)}</td>
                <td>{book.stock}</td>
                <td className="whitespace-nowrap text-right">
                  <button type="button" onClick={() => openEdit(book)} className="lib-link mr-3 font-semibold" style={{ color: "var(--accent)" }}>
                    Ndrysho
                  </button>
                  <button type="button" onClick={() => setDeletingBook(book)} className="lib-danger">
                    Fshi
                  </button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted">
                  Nuk ka ende libra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-12">
        <h2 className="text-[28px]">Porositë</h2>
        <div className="lib-card mt-5 overflow-x-auto p-1.5">
          <table className="lib-table min-w-[760px]">
            <thead>
              <tr>
                <th>Klienti</th>
                <th>Data</th>
                <th>Artikuj</th>
                <th>Totali</th>
                <th>Statusi</th>
                <th className="text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="font-semibold">{order.userName ?? order.shippingAddress.fullName}</span>
                    {order.userEmail && <span className="block text-xs text-muted">{order.userEmail}</span>}
                  </td>
                  <td className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="text-muted">{order.items.length}</td>
                  <td>€{order.total.toFixed(2)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value as OrderStatus)}
                      className="lib-input w-auto cursor-pointer py-1.5 pl-3 pr-8 text-xs"
                    >
                      {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <button type="button" onClick={() => setViewingOrder(order)} className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
                      Detaje
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted">
                    Nuk ka ende porosi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[28px]">Mesazhet e kontaktit</h2>
        <ul className="mt-4 space-y-3">
          {messages.length === 0 && <p className="text-sm text-muted">Nuk ka mesazhe ende.</p>}
          {messages.map((msg) => (
            <li key={msg._id} className="lib-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold">
                  {msg.name} &lt;{msg.email}&gt;
                </span>
                <span className="text-muted">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{msg.subject}</p>
              <p className="mt-1 text-sm text-muted">{msg.message}</p>
            </li>
          ))}
        </ul>
      </section>

      <BookFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} initialBook={editingBook} onSaved={handleSaved} />

      <Modal isOpen={Boolean(deletingBook)} onClose={() => setDeletingBook(null)} title="Konfirmo fshirjen">
        <p className="text-sm text-muted">
          A je i sigurt që dëshiron të fshish librin &quot;{deletingBook?.title}&quot;? Ky veprim nuk mund të kthehet.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeletingBook(null)}>
            Anulo
          </Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={deleting}>
            Fshi
          </Button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(viewingOrder)} onClose={() => setViewingOrder(null)} title="Detajet e porosisë">
        {viewingOrder && (
          <div className="flex flex-col gap-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted">
                Porosia <span className="font-mono">#{viewingOrder._id.slice(-8)}</span>
              </span>
              <span className="text-muted">{new Date(viewingOrder.createdAt).toLocaleString()}</span>
            </div>

            <div>
              <h3 className="lib-label mb-2">Klienti</h3>
              <p className="font-semibold">{viewingOrder.userName ?? viewingOrder.shippingAddress.fullName}</p>
              {viewingOrder.userEmail && <p className="text-muted">{viewingOrder.userEmail}</p>}
            </div>

            <div>
              <h3 className="lib-label mb-2">Adresa e dërgesës</h3>
              <p>{viewingOrder.shippingAddress.fullName}</p>
              <p className="text-muted">{viewingOrder.shippingAddress.address}</p>
              <p className="text-muted">{viewingOrder.shippingAddress.city}</p>
              <p className="text-muted">{viewingOrder.shippingAddress.phone}</p>
            </div>

            <div>
              <h3 className="lib-label mb-2">Artikujt</h3>
              <ul className="flex flex-col gap-2">
                {viewingOrder.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: "var(--line)" }}>
                    <span>
                      {item.title} <span className="text-muted">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--line)" }}>
              <span className="font-semibold">Totali</span>
              <span className="font-display text-[22px]">€{viewingOrder.total.toFixed(2)}</span>
            </div>

            <div>
              <h3 className="lib-label mb-2">Statusi</h3>
              <select
                value={viewingOrder.status}
                onChange={(e) => updateOrderStatus(viewingOrder._id, e.target.value as OrderStatus)}
                className="lib-input w-auto cursor-pointer"
              >
                {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
