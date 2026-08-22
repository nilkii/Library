import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import type { IBook } from "@/models/Book";
import type { LibraryStatus } from "@/types/models";
import { requireUser } from "@/lib/apiAuth";

const VALID_STATUSES: LibraryStatus[] = ["want", "reading", "read"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const session = await requireUser(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const user = (await User.findById(session.user.id)
      .populate("library.book")
      .lean()) as unknown as { library: { book: IBook; status: LibraryStatus }[] } | null;
    const entries = (user?.library ?? []).filter((entry) => entry.book);
    return res.status(200).json(entries);
  }

  if (req.method === "PUT") {
    const { bookId, status } = req.body ?? {};
    if (!bookId || typeof bookId !== "string") {
      return res.status(400).json({ message: "bookId mungon." });
    }
    if (status !== null && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status jo valid." });
    }

    const user = await User.findById(session.user.id);
    if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet." });

    const index = user.library.findIndex((entry) => entry.book.toString() === bookId);

    if (status === null) {
      if (index >= 0) user.library.splice(index, 1);
    } else if (index >= 0) {
      user.library[index].status = status;
    } else {
      user.library.push({ book: new mongoose.Types.ObjectId(bookId), status });
    }

    await user.save();
    return res.status(200).json({ status });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ message: "Method not allowed" });
}
