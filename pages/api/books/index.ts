import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import { requireAdmin } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "GET") {
    const { search, genre, sort } = req.query;
    const filter: Record<string, unknown> = {};

    if (typeof search === "string" && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { author: regex }];
    }
    if (typeof genre === "string" && genre.trim() && genre !== "all") {
      filter.genre = genre;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      title_asc: { title: 1 },
    };
    const sortOrder = sortMap[typeof sort === "string" ? sort : "newest"] ?? sortMap.newest;

    const books = await Book.find(filter).sort(sortOrder).lean();
    return res.status(200).json(books);
  }

  if (req.method === "POST") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    const {
      title,
      author,
      description,
      summary,
      price,
      genre,
      coverImage,
      stock,
      publishYear,
      pages,
      language,
      publisher,
      isbn,
    } = req.body ?? {};

    if (!title || !author || !description || !genre || !coverImage) {
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
    }
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({ message: "Çmimi duhet të jetë numër pozitiv." });
    }

    const book = await Book.create({
      title,
      author,
      description,
      summary,
      price,
      genre,
      coverImage,
      stock: typeof stock === "number" ? stock : 0,
      publishYear: typeof publishYear === "number" ? publishYear : undefined,
      pages: typeof pages === "number" ? pages : undefined,
      language: language || undefined,
      publisher: publisher || undefined,
      isbn: isbn || undefined,
    });

    try {
      await res.revalidate("/books");
      await res.revalidate("/");
    } catch {
      // ISR revalidation is best-effort; ignore failures (e.g. in test env).
    }

    return res.status(201).json(book);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
