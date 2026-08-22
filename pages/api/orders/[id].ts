import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/apiAuth";

const VALID_STATUSES = ["placed", "fulfilled", "cancelled"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID e pavlefshme." });
  }

  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: "Duhet të kyçesh për këtë veprim." });
    }

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Porosia nuk u gjet." });

    const isOwner = order.user.toString() === session.user.id;
    if (!isOwner && session.user.role !== "admin") {
      return res.status(403).json({ message: "Nuk ke qasje në këtë porosi." });
    }

    return res.status(200).json(order);
  }

  if (req.method === "PUT") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    const { status } = req.body ?? {};
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status jo valid." });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Porosia nuk u gjet." });

    return res.status(200).json(order);
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ message: "Method not allowed" });
}
