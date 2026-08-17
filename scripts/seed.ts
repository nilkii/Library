/* eslint-disable no-console */
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import User from "../models/User";
import Book from "../models/Book";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@libraria.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

const cover = (title: string) =>
  `https://placehold.co/400x600/6d28d9/white?text=${encodeURIComponent(title)}`;

const sampleBooks = [
  {
    title: "The Silent Mountain",
    author: "Elira Kastrati",
    description:
      "A gripping novel about a village hidden in the Albanian Alps and the secrets its people keep across generations.",
    price: 14.99,
    genre: "Fiction",
    stock: 12,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "An easy and proven way to build good habits and break bad ones, one tiny change at a time.",
    price: 19.99,
    genre: "Self-Help",
    stock: 25,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description:
      "A stunning blend of adventure and mysticism, environmentalism and politics on the desert planet Arrakis.",
    price: 17.5,
    genre: "Sci-Fi",
    stock: 8,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description:
      "A brief history of humankind, exploring how Homo sapiens came to dominate the world.",
    price: 21.0,
    genre: "History",
    stock: 15,
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description:
      "Between life and death there is a library, and within that library the shelves go on forever.",
    price: 13.75,
    genre: "Fiction",
    stock: 10,
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description:
      "A handbook of agile software craftsmanship that helps developers write better, cleaner code.",
    price: 29.99,
    genre: "Technology",
    stock: 6,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description:
      "A shepherd boy's journey to the Egyptian pyramids in search of a treasure, and the wisdom he finds along the way.",
    price: 11.99,
    genre: "Fiction",
    stock: 20,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about a woman who leaves her survivalist family and goes on to earn a PhD from Cambridge.",
    price: 16.25,
    genre: "Biography",
    stock: 9,
  },
];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Set it in .env.local before running the seed script.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      provider: "credentials",
    });
    console.log(`Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  for (const book of sampleBooks) {
    const exists = await Book.findOne({ title: book.title });
    if (!exists) {
      await Book.create({ ...book, coverImage: cover(book.title) });
      console.log(`Created book: ${book.title}`);
    }
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
