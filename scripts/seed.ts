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
  `https://placehold.co/400x600/1f6b4f/f6efe0/png?text=${encodeURIComponent(title)}`;

const covers: Record<string, string> = {
  "Atomic Habits": "/covers/atomic-habits.jpg",
  Dune: "/covers/dune.jpg",
  Sapiens: "/covers/sapiens.jpg",
  "The Midnight Library": "/covers/the-midnight-library.jpg",
  "Clean Code": "/covers/clean-code.jpg",
  "The Alchemist": "/covers/the-alchemist.jpg",
  Educated: "/covers/educated.jpg",
};

const sampleBooks = [
  {
    title: "The Silent Mountain",
    author: "Elira Kastrati",
    description:
      "A gripping novel about a village hidden in the Albanian Alps and the secrets its people keep across generations.",
    summary:
      "When journalist Dritan Hoxha returns to the remote mountain village his grandmother fled forty years earlier, he expects a quiet week of research for a family history project. Instead he finds a community bound together by a pact nobody will explain, a decades-old disappearance the elders refuse to discuss, and a house at the edge of the village that has stood empty since the winter of 1978. As Dritan pieces together letters, oral histories, and the reluctant testimony of his own grandmother, the mountain's silence starts to feel less like tradition and more like a wall built to keep something in. The Silent Mountain is a slow-burning story about memory, guilt, and what a community chooses to forget in order to survive.",
    price: 14.99,
    genre: "Fiction",
    stock: 12,
    publishYear: 2021,
    pages: 312,
    language: "English",
    publisher: "Onufri Press",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "An easy and proven way to build good habits and break bad ones, one tiny change at a time.",
    summary:
      "James Clear argues that the outcomes of our lives are rarely the product of one big decision — they are the compound interest of small, repeated actions. Atomic Habits breaks habit formation down into a practical four-step loop of cue, craving, response, and reward, and shows how to redesign your environment so good habits become the path of least resistance. Drawing on behavioral psychology and real examples ranging from Olympic athletes to Fortune 500 companies, the book makes the case that identity change — becoming the type of person who does the habit — is more durable than relying on willpower alone. It's less a motivational pep talk than a systems manual for building a life out of 1% improvements.",
    price: 19.99,
    genre: "Self-Help",
    stock: 25,
    publishYear: 2018,
    pages: 320,
    language: "English",
    publisher: "Avery",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    description:
      "A stunning blend of adventure and mysticism, environmentalism and politics on the desert planet Arrakis.",
    summary:
      "Paul Atreides is heir to a noble house entrusted with the stewardship of Arrakis, the only source in the universe of the spice melange — a substance that extends life, expands consciousness, and makes interstellar travel possible. When political betrayal shatters House Atreides, Paul and his mother are forced into the deep desert, where they must win the trust of the native Fremen if they are to survive. What follows is a story of ecology, prophecy, and empire, as Paul is transformed by the harsh discipline of the desert into a figure whose visions of the future threaten to consume the very people who follow him. Dune is as much a meditation on power, religion, and resource scarcity as it is a science-fiction epic.",
    price: 17.5,
    genre: "Sci-Fi",
    stock: 8,
    publishYear: 1965,
    pages: 412,
    language: "English",
    publisher: "Ace Books",
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description:
      "A brief history of humankind, exploring how Homo sapiens came to dominate the world.",
    summary:
      "Harari traces the arc of our species from an unremarkable animal foraging on the African savanna to the dominant force shaping the planet, organizing the journey around three great revolutions: cognitive, agricultural, and scientific. Along the way he argues that what truly set Homo sapiens apart was not intelligence or tool use but the capacity to believe in shared fictions — money, nations, religions, and corporations — that allow strangers to cooperate at a scale no other species can manage. Sapiens moves briskly through the rise of empires, the birth of capitalism, and the industrial and information revolutions, always returning to an uncomfortable question: has all this progress actually made us happier? It's a big-picture history built to make familiar things — money, laws, human rights — look strange again.",
    price: 21.0,
    genre: "History",
    stock: 15,
    publishYear: 2014,
    pages: 443,
    language: "English",
    publisher: "Harper",
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description:
      "Between life and death there is a library, and within that library the shelves go on forever.",
    summary:
      "After a lifetime of regrets finally catches up with her, Nora Seed finds herself in the Midnight Library, a place that exists between life and death where every book on its endless shelves lets her live out a different version of her life — the one where she didn't quit the band, the one where she married her ex, the one where she became an Olympic swimmer. Guided by her old school librarian, Nora slips from life to life searching for the one that will finally make her happy, only to discover that no version is as perfect as it first appears. Funny, philosophical and quietly devastating, The Midnight Library is ultimately a novel about what actually makes a life worth living — not the absence of regret, but the choice to keep going anyway.",
    price: 13.75,
    genre: "Fiction",
    stock: 10,
    publishYear: 2020,
    pages: 304,
    language: "English",
    publisher: "Canongate Books",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description:
      "A handbook of agile software craftsmanship that helps developers write better, cleaner code.",
    summary:
      "Clean Code is built on a simple but uncomfortable premise: even bad code can run, but if it isn't clean it will eventually bring a development team to its knees. Robert Martin — 'Uncle Bob' — walks through concrete principles for naming, functions, comments, formatting, error handling, unit tests, and class design, illustrated with before-and-after refactorings of real code. Rather than abstract theory, the book reads like an apprenticeship: each chapter builds a case for why sloppy code is technical debt with compounding interest, and shows the discipline required to leave code better than you found it. It has become one of the standard references for professional software craftsmanship, especially in codebases meant to be maintained for years by more than one person.",
    price: 29.99,
    genre: "Technology",
    stock: 6,
    publishYear: 2008,
    pages: 464,
    language: "English",
    publisher: "Prentice Hall",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description:
      "A shepherd boy's journey to the Egyptian pyramids in search of a treasure, and the wisdom he finds along the way.",
    summary:
      "Santiago is an Andalusian shepherd who dreams repeatedly of a treasure buried near the Egyptian pyramids. Convinced the dream is an omen, he sells his flock and sets out across North Africa, meeting a king, a crystal merchant, an Englishman studying alchemy, and finally an alchemist himself, each of whom teaches him something about listening to what Coelho calls his 'Personal Legend.' The journey is less about the literal treasure than about the philosophy Santiago absorbs along the way — that the world speaks a universal language of signs, and that the real obstacle to a meaningful life is usually fear of pursuing it. Simply told and fable-like in structure, The Alchemist has become one of the best-selling novels in history for its message that the pursuit itself transforms the person who dares to undertake it.",
    price: 11.99,
    genre: "Fiction",
    stock: 20,
    publishYear: 1988,
    pages: 208,
    language: "English",
    publisher: "HarperOne",
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about a woman who leaves her survivalist family and goes on to earn a PhD from Cambridge.",
    summary:
      "Tara Westover was raised by survivalist parents in the mountains of Idaho, kept out of school and away from doctors, and put to work from a young age in her father's junkyard and her mother's midwifery practice. She did not set foot in a classroom until she was seventeen, when a self-taught crash course in mathematics and grammar won her admission to Brigham Young University — the first step of a path that eventually led to a PhD from Cambridge. Educated is the story of that transformation, but also of its cost: every step toward the wider world pulled Tara further from a family that saw her education as a betrayal, culminating in an estrangement that the book never resolves neatly. It's a memoir less about the triumph of self-invention than about the impossible arithmetic of loving people you have to leave.",
    price: 16.25,
    genre: "Biography",
    stock: 9,
    publishYear: 2018,
    pages: 334,
    language: "English",
    publisher: "Random House",
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
    const existing = await Book.findOneAndUpdate(
      { title: book.title },
      { ...book, coverImage: covers[book.title] ?? cover(book.title) },
      { upsert: true, new: false }
    );
    console.log(existing ? `Updated book: ${book.title}` : `Created book: ${book.title}`);
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
