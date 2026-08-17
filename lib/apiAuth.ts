import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function requireUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({ message: "Duhet të kyçesh për këtë veprim." });
    return null;
  }
  return session;
}

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({ message: "Duhet të kyçesh për këtë veprim." });
    return null;
  }
  if (session.user.role !== "admin") {
    res.status(403).json({ message: "Vetëm adminët kanë qasje këtu." });
    return null;
  }
  return session;
}
