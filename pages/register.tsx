import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const result = await res.json();

      if (!res.ok) {
        setFormError(result.message ?? "Diçka shkoi keq.");
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setFormError("Problem me lidhjen. Provo përsëri.");
    }
  };

  return (
    <div className="container-page flex justify-center py-[70px]">
      <Head>
        <title>Register — Libraria</title>
      </Head>

      <div className="w-full max-w-[440px]">
        <h1 className="text-[42px]">Regjistrohu</h1>
        <p className="mt-2.5 text-muted">
          Ke tashmë llogari?{" "}
          <Link href="/login" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
            Kyçu
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-[26px] flex flex-col gap-5" noValidate>
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
            <label htmlFor="password" className="lib-label">
              Fjalëkalimi
            </label>
            <input
              id="password"
              type="password"
              className="lib-input"
              {...register("password", {
                required: "Fjalëkalimi është i detyrueshëm.",
                minLength: { value: 6, message: "Të paktën 6 karaktere." },
              })}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="lib-label">
              Konfirmo fjalëkalimin
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="lib-input"
              {...register("confirmPassword", {
                required: "Konfirmimi është i detyrueshëm.",
                validate: (value) => value === watch("password") || "Fjalëkalimet nuk përputhen.",
              })}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" isLoading={isSubmitting} fullWidth style={{ padding: "14px" }}>
            Regjistrohu
          </Button>
        </form>

        <div className="my-[26px] flex items-center gap-3.5 text-xs uppercase text-muted">
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
          OSE
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>

        <div className="flex flex-col gap-3">
          <Button type="button" variant="ghost" fullWidth onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            Vazhdo me Google
          </Button>
        </div>
      </div>
    </div>
  );
}
