import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import { requireUser } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID e pavlefshme." });
  }

  const session = await requireUser(req, res);
  if (!session) return;

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: "Komenti nuk u gjet." });

  const isOwner = review.user.toString() === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Nuk ke qasje për këtë veprim." });
  }

  if (req.method === "PUT") {
    const { rating, comment } = req.body ?? {};
    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Vlerësimi duhet të jetë 1-5." });
      }
      review.rating = rating;
    }
    if (comment !== undefined) {
      if (typeof comment !== "string" || comment.trim().length < 3) {
        return res.status(400).json({ message: "Komenti duhet të ketë të paktën 3 karaktere." });
      }
      review.comment = comment.trim();
    }
    await review.save();

    try {
      await res.revalidate(`/books/${review.book.toString()}`);
    } catch {
      // best-effort ISR revalidation
    }

    return res.status(200).json(review);
  }

  if (req.method === "DELETE") {
    const bookId = review.book.toString();
    await review.deleteOne();

    try {
      await res.revalidate(`/books/${bookId}`);
    } catch {
      // best-effort ISR revalidation
    }

    return res.status(200).json({ message: "Komenti u fshi." });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).json({ message: "Method not allowed" });
}
