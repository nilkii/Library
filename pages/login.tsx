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
    <div className="container-page flex justify-center py-[70px]">
      <Head>
        <title>Login — Libraria</title>
      </Head>

      <div className="w-full max-w-[420px]">
        <h1 className="text-[42px]">Kyçu</h1>
        <p className="mt-2.5 text-muted">
          Nuk ke llogari?{" "}
          <Link href="/register" className="lib-link font-semibold" style={{ color: "var(--accent)" }}>
            Regjistrohu
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-[26px] flex flex-col gap-5" noValidate>
          <div>
            <label htmlFor="email" className="lib-label">
              Email
            </label>
            <input id="email" type="email" className="lib-input" {...register("email", { required: "Email-i është i detyrueshëm." })} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="lib-label">
              Fjalëkalimi
            </label>
            <input id="password" type="password" className="lib-input" {...register("password", { required: "Fjalëkalimi është i detyrueshëm." })} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" isLoading={isSubmitting} fullWidth style={{ padding: "14px" }}>
            Kyçu
          </Button>
        </form>

        <div className="my-[26px] flex items-center gap-3.5 text-xs uppercase text-muted">
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
          OSE
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>

        <div className="flex flex-col gap-3">
          <Button type="button" variant="ghost" fullWidth onClick={() => signIn("google", { callbackUrl })}>
            Vazhdo me Google
          </Button>
        </div>
      </div>
    </div>
  );
}
