import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import BookGrid from "@/components/BookGrid";
import type { BookDTO } from "@/types/models";

const GENRE_BLURBS: Record<string, string> = {
  Fiction: "Histori të trilluara që të zhysin në jetë e botë të tjera, nga drama intime deri te epika.",
  "Sci-Fi": "Bota të imagjinuara, teknologji e së ardhmes dhe pyetje të mëdha rreth njerëzimit.",
  Biography: "Jetë të vërteta, tregime personale që frymëzojnë dhe japin perspektivë.",
  History: "Ngjarje dhe periudha që kanë formësuar botën siç e njohim sot.",
  Technology: "Libra praktikë për zhvillim software-i, dizajn dhe mendim inxhinierik.",
  "Self-Help": "Këshilla praktike për zakone, produktivitet dhe rritje personale.",
  Komedi: "Tregime të lehta e humoristike, ideale për një lexim relaksues.",
};

const DEFAULT_BLURB = "Zbuloni librat më të mirë të këtij zhanri, të zgjedhur nga katalogu ynë.";

interface GenrePageProps {
  genre: string;
  books: BookDTO[];
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    await dbConnect();
    const genres = await Book.distinct("genre");
    return {
      paths: genres.map((genre: string) => ({ params: { genre } })),
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Genre getStaticPaths failed:", error);
    return { paths: [], fallback: "blocking" };
  }
};

export const getStaticProps: GetStaticProps<GenrePageProps> = async ({ params }) => {
  const genre = params?.genre as string;
  await dbConnect();
  const books = await Book.find({ genre }).sort({ createdAt: -1 }).lean();

  if (books.length === 0) {
    return { notFound: true, revalidate: 60 };
  }

  return {
    props: { genre, books: JSON.parse(JSON.stringify(books)) },
    revalidate: 60,
  };
};

export default function GenrePage({ genre, books }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="container-page py-12">
      <Head>
        <title>{genre} — Libraria</title>
      </Head>

      <span className="lib-tag">{genre}</span>
      <h1 className="mt-3.5 text-[clamp(32px,4.4vw,52px)]">{genre}</h1>
      <p className="mt-3 max-w-[60ch] text-muted">{GENRE_BLURBS[genre] ?? DEFAULT_BLURB}</p>

      <div className="mt-9">
        <BookGrid books={books} />
      </div>
    </div>
  );
}
