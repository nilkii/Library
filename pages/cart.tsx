import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Button from "@/components/Button";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const goToCheckout = () => {
    router.push(session ? "/checkout" : "/login?callbackUrl=/checkout");
  };

  return (
    <div className="container-page py-14">
      <Head>
        <title>Shporta — Libraria</title>
      </Head>

      <h1 className="text-[clamp(30px,4vw,48px)]">Shporta</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-muted">
          Shporta jote është bosh.{" "}
          <Link href="/books" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
            Shfleto librat
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.bookId} className="lib-card flex items-center gap-4 p-4">
                <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-xl" style={{ background: "var(--surface-2)" }}>
                  <Image src={item.coverImage} alt={item.title} fill sizes="72px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/books/${item.bookId}`} className="lib-link font-semibold">
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted">{item.author}</p>
                  <p className="font-display mt-1 text-lg">€{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center overflow-hidden rounded-full" style={{ border: "1px solid var(--line)" }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.bookId, item.quantity - 1)}
                    aria-label="Zvogëlo sasinë"
                    className="h-9 w-9 cursor-pointer border-0 bg-transparent"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.bookId, item.quantity + 1)}
                    aria-label="Shto sasinë"
                    className="h-9 w-9 cursor-pointer border-0 bg-transparent"
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                <button type="button" onClick={() => removeItem(item.bookId)} className="lib-danger">
                  Hiq
                </button>
              </div>
            ))}
          </div>

          <div className="lib-card p-7">
            <h2 className="text-[22px]">Përmbledhja</h2>
            <div className="mt-5 flex items-center justify-between text-sm text-muted">
              <span>Nëntotali</span>
              <span className="font-display text-lg text-ink">€{subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-xs text-muted">Pagesa bëhet me para në dorë (Cash on Delivery).</p>
            <Button onClick={goToCheckout} fullWidth className="mt-6">
              Vazhdo te pagesa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
