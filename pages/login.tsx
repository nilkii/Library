import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const callbackUrl = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setFormError("Email ose fjalëkalim i pasaktë.");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="container-page flex justify-center py-16">
      <Head>
        <title>Login — Libraria</title>
      </Head>

      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100">Kyçu</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Nuk ke llogari?{" "}
          <Link href="/register" className="text-brand-600 hover:underline dark:text-brand-400">
            Regjistrohu
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("email", { required: "Email-i është i detyrueshëm." })}
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
              {...register("password", { required: "Fjalëkalimi është i detyrueshëm." })}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Kyçu
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          <span className="text-xs uppercase text-gray-400">ose</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="mt-4 space-y-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => signIn("google", { callbackUrl })}
          >
            Vazhdo me Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => signIn("facebook", { callbackUrl })}
          >
            Vazhdo me Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
