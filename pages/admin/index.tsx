import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import ContactMessage from "@/models/ContactMessage";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import BookFormModal from "@/components/BookFormModal";
import type { BookDTO, ContactMessageDTO } from "@/types/models";

interface AdminProps {
  books: BookDTO[];
  messages: ContactMessageDTO[];
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
  const books = await Book.find().sort({ createdAt: -1 }).lean();
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(20).lean();

  return {
    props: {
      books: JSON.parse(JSON.stringify(books)),
      messages: JSON.parse(JSON.stringify(messages)),
    },
  };
};

export default function AdminPanel({ books: initialBooks, messages }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [books, setBooks] = useState(initialBooks);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDTO | null>(null);
  const [deletingBook, setDeletingBook] = useState<BookDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="container-page py-12">
      <Head>
        <title>Admin Panel — Libraria</title>
      </Head>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">Paneli i Adminit</h1>
        <Button onClick={openCreate}>+ Shto libër</Button>
      </div>

      <section className="mt-8 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Titulli</th>
              <th className="px-4 py-3">Autori</th>
              <th className="px-4 py-3">Zhanri</th>
              <th className="px-4 py-3">Çmimi</th>
              <th className="px-4 py-3">Stoku</th>
              <th className="px-4 py-3 text-right">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {books.map((book) => (
              <tr key={book._id}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{book.title}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{book.author}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{book.genre}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">€{book.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{book.stock}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(book)}
                    className="mr-3 text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Ndrysho
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingBook(book)}
                    className="text-red-600 hover:underline"
                  >
                    Fshi
                  </button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Nuk ka ende libra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-gray-100">Mesazhet e kontaktit</h2>
        <ul className="mt-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nuk ka mesazhe ende.</p>
          )}
          {messages.map((msg) => (
            <li key={msg._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {msg.name} &lt;{msg.email}&gt;
                </span>
                <span className="text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{msg.subject}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{msg.message}</p>
            </li>
          ))}
        </ul>
      </section>

      <BookFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialBook={editingBook}
        onSaved={handleSaved}
      />

      <Modal isOpen={Boolean(deletingBook)} onClose={() => setDeletingBook(null)} title="Konfirmo fshirjen">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          A je i sigurt që dëshiron të fshish librin &quot;{deletingBook?.title}&quot;? Ky veprim nuk mund të kthehet.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingBook(null)}>
            Anulo
          </Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={deleting}>
            Fshi
          </Button>
        </div>
      </Modal>
    </div>
  );
}
