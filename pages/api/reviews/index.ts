import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { requireUser } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "GET") {
    const { bookId } = req.query;
    if (typeof bookId !== "string") {
      return res.status(400).json({ message: "bookId mungon." });
    }
    const reviews = await Review.find({ book: bookId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(reviews);
  }

  if (req.method === "POST") {
    const session = await requireUser(req, res);
    if (!session) return;

    const { bookId, rating, comment } = req.body ?? {};

    if (!bookId || typeof bookId !== "string") {
      return res.status(400).json({ message: "bookId mungon." });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Vlerësimi duhet të jetë 1-5." });
    }
    if (!comment || typeof comment !== "string" || comment.trim().length < 3) {
      return res.status(400).json({ message: "Komenti duhet të ketë të paktën 3 karaktere." });
    }

    const review = await Review.findOneAndUpdate(
      { book: bookId, user: session.user.id },
      {
        book: bookId,
        user: session.user.id,
        userName: session.user.name ?? "Përdorues",
        rating,
        comment: comment.trim(),
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    try {
      await res.revalidate(`/books/${bookId}`);
    } catch {
      // best-effort ISR revalidation
    }

    return res.status(201).json(review);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
