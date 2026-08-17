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
    <div className="container-page flex justify-center py-16">
      <Head>
        <title>Register — Libraria</title>
      </Head>

      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100">Regjistrohu</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ke tashmë llogari?{" "}
          <Link href="/login" className="text-brand-600 hover:underline dark:text-brand-400">
            Kyçu
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Fjalëkalimi
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("password", {
                required: "Fjalëkalimi është i detyrueshëm.",
                minLength: { value: 6, message: "Të paktën 6 karaktere." },
              })}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Konfirmo fjalëkalimin
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("confirmPassword", {
                required: "Konfirmimi është i detyrueshëm.",
                validate: (value) => value === watch("password") || "Fjalëkalimet nuk përputhen.",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Regjistrohu
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          <span className="text-xs uppercase text-gray-400">ose</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="mt-4 space-y-2">
          <Button type="button" variant="secondary" fullWidth onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            Vazhdo me Google
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}>
            Vazhdo me Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
