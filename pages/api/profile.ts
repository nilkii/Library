import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireUser } from "@/lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();
  const session = await requireUser(req, res);
  if (!session) return;

  const { name, image, currentPassword, newPassword } = req.body ?? {};

  const user = await User.findById(session.user.id).select("+password");
  if (!user) return res.status(404).json({ message: "Përdoruesi nuk u gjet." });

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Emri duhet të ketë të paktën 2 karaktere." });
    }
    user.name = name.trim();
  }

  if (image !== undefined) {
    user.image = typeof image === "string" ? image : user.image;
  }

  if (newPassword) {
    if (user.provider !== "credentials") {
      return res.status(400).json({
        message: "Llogaria jote është krijuar përmes OAuth, nuk mund të ndryshosh fjalëkalimin.",
      });
    }
    if (!currentPassword || !user.password) {
      return res.status(400).json({ message: "Duhet të japësh fjalëkalimin aktual." });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Fjalëkalimi aktual është i pasaktë." });
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  return res.status(200).json({
    message: "Profili u përditësua me sukses.",
    user: { name: user.name, image: user.image, email: user.email },
  });
}
