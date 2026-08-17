import { useState } from "react";
import Head from "next/head";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();

  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: result.message ?? "Diçka shkoi keq." });
        return;
      }

      setStatus({ type: "success", text: result.message ?? "Mesazhi u dërgua me sukses!" });
      reset();
    } catch {
      setStatus({ type: "error", text: "Problem me lidhjen. Provo përsëri." });
    }
  };

  return (
    <div className="container-page py-16">
      <Head>
        <title>Contact — Libraria</title>
      </Head>

      <div className="mx-auto max-w-xl">
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">Na kontaktoni</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Keni pyetje apo sugjerime? Plotësoni formën më poshtë dhe do t&apos;ju kontaktojmë sa më shpejt.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Emri
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("name", { required: "Emri është i detyrueshëm.", minLength: { value: 2, message: "Të paktën 2 karaktere." } })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("email", {
                required: "Email-i është i detyrueshëm.",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email jo valid." },
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Subjekti
            </label>
            <input
              id="subject"
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("subject", { required: "Subjekti është i detyrueshëm." })}
            />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Mesazhi
            </label>
            <textarea
              id="message"
              rows={5}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("message", {
                required: "Mesazhi është i detyrueshëm.",
                minLength: { value: 10, message: "Të paktën 10 karaktere." },
              })}
            />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
          </div>

          {status && (
            <p className={`text-sm ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {status.text}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Dërgo Mesazhin
          </Button>
        </form>
      </div>
    </div>
  );
}
