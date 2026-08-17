import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import ContactMessage from "@/models/ContactMessage";
import { requireAdmin } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "POST") {
    const { name, email, subject, message } = req.body ?? {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Emri duhet të ketë të paktën 2 karaktere." });
    }
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Email-i nuk është valid." });
    }
    if (!subject || typeof subject !== "string" || subject.trim().length < 2) {
      return res.status(400).json({ message: "Subjekti është i detyrueshëm." });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return res.status(400).json({ message: "Mesazhi duhet të ketë të paktën 10 karaktere." });
    }

    const saved = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({ message: "Mesazhi u dërgua me sukses!", id: saved._id.toString() });
  }

  if (req.method === "GET") {
    const session = await requireAdmin(req, res);
    if (!session) return;

    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(messages);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
