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
    return res.status(200).json(user?.favorites ?? []);
  }

  if (req.method === "POST") {
    const { bookId } = req.body ?? {};
    if (!bookId || typeof bookId !== "string") {
      return res.status(400).json({ message: "bookId mungon." });
    }

    const user = await User.findById(session.user.id);
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet." });

    const index = user.favorites.findIndex(
      (fav: mongoose.Types.ObjectId) => fav.toString() === bookId
    );
    let favorited: boolean;
    if (index >= 0) {
      user.favorites.splice(index, 1);
      favorited = false;
    } else {
      user.favorites.push(new mongoose.Types.ObjectId(bookId));
      favorited = true;
    }
    await user.save();

    return res.status(200).json({ favorited });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
