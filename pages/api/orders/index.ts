import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import Order from "@/models/Order";
import { requireUser } from "@/lib/apiAuth";

interface CartItemInput {
  bookId: string;
  quantity: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const session = await requireUser(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(orders);
  }

  if (req.method === "POST") {
    const { items, shippingAddress } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Shporta është bosh." });
    }
    const { fullName, address, city, phone } = shippingAddress ?? {};
    if (!fullName || !address || !city || !phone) {
      return res.status(400).json({ message: "Të gjitha të dhënat e dërgesës janë të detyrueshme." });
    }

    const orderItems = [];
    let total = 0;

    for (const raw of items as CartItemInput[]) {
      const quantity = Number(raw?.quantity);
      if (!raw?.bookId || !Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Artikull i pavlefshëm në shportë." });
      }

      const book = await Book.findById(raw.bookId);
      if (!book) {
        return res.status(404).json({ message: "Një nga librat nuk ekziston më." });
      }
      if (book.stock < quantity) {
        return res.status(409).json({ message: `"${book.title}" nuk ka stok të mjaftueshëm.` });
      }

      book.stock -= quantity;
      await book.save();

      orderItems.push({ book: book._id, title: book.title, price: book.price, quantity });
      total += book.price * quantity;
    }

    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      total,
      shippingAddress: { fullName, address, city, phone },
    });

    try {
      await res.revalidate("/books");
      await res.revalidate("/");
    } catch {
      // best-effort ISR revalidation
    }

    return res.status(201).json(order);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
