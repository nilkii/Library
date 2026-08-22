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

      <div className="mx-auto max-w-[620px] pt-4">
        <h1 className="text-[clamp(30px,4vw,48px)]">Na kontaktoni</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Keni pyetje apo sugjerime? Plotësoni formën më poshtë dhe do t&apos;ju kontaktojmë sa më shpejt.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5" noValidate>
          <div>
            <label htmlFor="name" className="lib-label">
              Emri
            </label>
            <input
              id="name"
              type="text"
              className="lib-input"
              {...register("name", { required: "Emri është i detyrueshëm.", minLength: { value: 2, message: "Të paktën 2 karaktere." } })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="lib-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="lib-input"
              {...register("email", {
                required: "Email-i është i detyrueshëm.",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email jo valid." },
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="subject" className="lib-label">
              Subjekti
            </label>
            <input id="subject" type="text" className="lib-input" {...register("subject", { required: "Subjekti është i detyrueshëm." })} />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>

          <div>
            <label htmlFor="message" className="lib-label">
              Mesazhi
            </label>
            <textarea
              id="message"
              rows={5}
              className="lib-input resize-y"
              {...register("message", {
                required: "Mesazhi është i detyrueshëm.",
                minLength: { value: 10, message: "Të paktën 10 karaktere." },
              })}
            />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
          </div>

          {status && (
            <p className={`text-sm ${status.type === "success" ? "" : "text-red-600"}`} style={status.type === "success" ? { color: "var(--ok)" } : undefined}>
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
