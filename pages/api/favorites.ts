import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import type { IBook } from "@/models/Book";
import { requireUser } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const session = await requireUser(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const user = (await User.findById(session.user.id)
      .populate("favorites")
      .lean()) as unknown as { favorites: IBook[] } | null;
    const books = (user?.favorites ?? []).filter(Boolean);
    return res.status(200).json(books);
  }

  if (req.method === "PUT") {
    const { bookId } = req.body ?? {};
    if (!bookId || typeof bookId !== "string") {
      return res.status(400).json({ message: "bookId mungon." });
    }

    const user = await User.findById(session.user.id);
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet." });

    const index = user.favorites.findIndex((id) => id.toString() === bookId);
    let favorite: boolean;

    if (index >= 0) {
      user.favorites.splice(index, 1);
      favorite = false;
    } else {
      user.favorites.push(new mongoose.Types.ObjectId(bookId));
      favorite = true;
    }

    await user.save();
    return res.status(200).json({ favorite });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ message: "Method not allowed" });
}
