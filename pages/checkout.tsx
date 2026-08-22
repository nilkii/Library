import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Button from "@/components/Button";
import { useCart } from "@/context/CartContext";

interface CheckoutFormValues {
  fullName: string;
  address: string;
  city: string;
  phone: string;
}

export const getServerSideProps: GetServerSideProps<{ userName: string }> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/checkout", permanent: false } };
  }
  return { props: { userName: session.user.name ?? "" } };
};

export default function Checkout({ userName }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({ defaultValues: { fullName: userName } });

  const onSubmit = async (data: CheckoutFormValues) => {
    setFormError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
          shippingAddress: data,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setFormError(result.message ?? "Diçka shkoi keq.");
        return;
      }

      clear();
      router.push(`/orders/${result._id}`);
    } catch {
      setFormError("Problem me lidhjen. Provo përsëri.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <Head>
          <title>Checkout — Libraria</title>
        </Head>
        <p className="text-muted">Shporta jote është bosh — nuk ka çfarë të porositet.</p>
        <Button href="/books" className="mt-6">
          Shfleto librat
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <Head>
        <title>Checkout — Libraria</title>
      </Head>

      <h1 className="text-[clamp(30px,4vw,48px)]">Përfundo porosinë</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <div className="lib-card p-7">
          <h2 className="text-[22px]">Artikujt</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.bookId} className="flex items-center justify-between text-sm">
                <span>
                  {item.title} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--line)" }}>
            <span className="font-semibold">Totali</span>
            <span className="font-display text-2xl">€{subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-3 text-xs text-muted">Pagesa: Cash on Delivery — paguan në momentin e dorëzimit.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lib-card flex flex-col gap-4 p-7" noValidate>
          <h2 className="text-[22px]">Të dhënat e dërgesës</h2>

          <div>
            <label className="lib-label">Emri i plotë</label>
            <input className="lib-input" {...register("fullName", { required: "E detyrueshme." })} />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="lib-label">Adresa</label>
            <input className="lib-input" {...register("address", { required: "E detyrueshme." })} />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="lib-label">Qyteti</label>
              <input className="lib-input" {...register("city", { required: "E detyrueshme." })} />
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
            </div>
            <div>
              <label className="lib-label">Telefoni</label>
              <input className="lib-input" {...register("phone", { required: "E detyrueshme." })} />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-2">
            Konfirmo Porosinë
          </Button>
        </form>
      </div>
    </div>
  );
}
