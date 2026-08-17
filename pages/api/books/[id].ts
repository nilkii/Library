import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import Review from "@/models/Review";
import { requireAdmin } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID e pavlefshme." });
  }

  if (req.method === "GET") {
    const book = await Book.findById(id).lean();
    if (!book) return res.status(404).json({ message: "Libri nuk u gjet." });
    return res.status(200).json(book);
  }

  if (req.method === "PUT") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    const { title, author, description, price, genre, coverImage, stock } = req.body ?? {};
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (author !== undefined) update.author = author;
    if (description !== undefined) update.description = description;
    if (price !== undefined) update.price = price;
    if (genre !== undefined) update.genre = genre;
    if (coverImage !== undefined) update.coverImage = coverImage;
    if (stock !== undefined) update.stock = stock;

    const book = await Book.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: "Libri nuk u gjet." });

    try {
      await res.revalidate("/books");
      await res.revalidate(`/books/${id}`);
      await res.revalidate("/");
    } catch {
      // best-effort ISR revalidation
    }

    return res.status(200).json(book);
  }

  if (req.method === "DELETE") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    const book = await Book.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ message: "Libri nuk u gjet." });

    await Review.deleteMany({ book: id });

    try {
      await res.revalidate("/books");
      await res.revalidate("/");
    } catch {
      // best-effort ISR revalidation
    }

    return res.status(200).json({ message: "Libri u fshi me sukses." });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ message: "Method not allowed" });
}
