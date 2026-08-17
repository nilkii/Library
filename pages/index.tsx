import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import dbConnect from "@/lib/dbConnect";
import Book from "@/models/Book";
import BookCard from "@/components/BookCard";
import Button from "@/components/Button";
import type { BookDTO } from "@/types/models";

export const getStaticProps: GetStaticProps<{ featuredBooks: BookDTO[] }> = async () => {
  try {
    await dbConnect();
    const books = await Book.find().sort({ createdAt: -1 }).limit(4).lean();

    return {
      props: {
        featuredBooks: JSON.parse(JSON.stringify(books)),
      },
      revalidate: 60,
    };
  } catch (error) {
    // Keep the build/deploy from hard-failing if the DB is briefly unreachable;
    // ISR will retry on the next revalidation window.
    console.error("Home getStaticProps failed:", error);
    return { props: { featuredBooks: [] }, revalidate: 60 };
  }
};

export default function Home({ featuredBooks }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container-page flex flex-col items-center gap-6 py-20 text-center">
          <h1 className="font-serif text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
            Gjeni librin tuaj të radhës në <span className="text-brand-600 dark:text-brand-400">Libraria</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Një dyqan online i thjeshtë me libra nga zhanre të ndryshme — shfletoni, lexoni përshkrime,
            lini vlerësime dhe ruani librat tuaj të preferuar.
          </p>
          <div className="flex gap-4">
            <Button href="/books" size="lg">
              Shfleto Librat
            </Button>
            <Button href="/about" size="lg" variant="secondary">
              Mëso më shumë
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100">
            Librat më të fundit
          </h2>
          <Link href="/books" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            Shiko të gjitha →
          </Link>
        </div>

        {featuredBooks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Ende nuk ka libra. Admini mund t&apos;i shtojë ata nga paneli i administrimit.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-gray-200 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-900">
        <div className="container-page grid gap-8 sm:grid-cols-3">
          <Feature icon="📦" title="Gjerësi zhanresh" text="Fiction, sci-fi, histori, biznes e më shumë." />
          <Feature icon="❤️" title="Të preferuarat" text="Ruaj librat që të pëlqejnë për më vonë." />
          <Feature icon="⭐" title="Vlerësime" text="Lexo dhe shkruaj vlerësime për çdo libër." />
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
}
