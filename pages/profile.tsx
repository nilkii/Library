import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useForm } from "react-hook-form";
import { getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Button from "@/components/Button";

interface ProfileProps {
  name: string;
  email: string;
  image: string;
  provider: string;
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return { redirect: { destination: "/login?callbackUrl=/profile", permanent: false } };
  }

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return {
    props: {
      name: user.name,
      email: user.email,
      image: user.image ?? "",
      provider: user.provider,
    },
  };
};

interface ProfileFormValues {
  name: string;
  image: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

export default function Profile({ name, email, image, provider }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { update } = useSession();
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const profileForm = useForm<ProfileFormValues>({ defaultValues: { name, image } });
  const passwordForm = useForm<PasswordFormValues>();

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setProfileStatus(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
      setProfileStatus({ type: "error", text: result.message ?? "Diçka shkoi keq." });
      return;
    }

    await update({ name: data.name, image: data.image });
    setProfileStatus({ type: "success", text: "Profili u përditësua!" });
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setPasswordStatus(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
      setPasswordStatus({ type: "error", text: result.message ?? "Diçka shkoi keq." });
      return;
    }

    passwordForm.reset();
    setPasswordStatus({ type: "success", text: "Fjalëkalimi u ndryshua!" });
  };

  return (
    <div className="container-page max-w-xl py-12">
      <Head>
        <title>Profile — Libraria</title>
      </Head>

      <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-100">Profili im</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{email}</p>

      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-8 space-y-4" noValidate>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Të dhënat e mia</h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Emri
          </label>
          <input
            id="name"
            type="text"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...profileForm.register("name", { required: "Emri është i detyrueshëm.", minLength: { value: 2, message: "Të paktën 2 karaktere." } })}
          />
          {profileForm.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            URL e fotos (opsionale)
          </label>
          <input
            id="image"
            type="url"
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...profileForm.register("image")}
          />
        </div>

        {profileStatus && (
          <p className={`text-sm ${profileStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {profileStatus.text}
          </p>
        )}

        <Button type="submit" isLoading={profileForm.formState.isSubmitting}>
          Ruaj ndryshimet
        </Button>
      </form>

      {provider === "credentials" && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-12 space-y-4 border-t border-gray-200 pt-8 dark:border-gray-800" noValidate>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ndrysho fjalëkalimin</h2>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Fjalëkalimi aktual
            </label>
            <input
              id="currentPassword"
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...passwordForm.register("currentPassword", { required: "E detyrueshme." })}
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Fjalëkalimi i ri
            </label>
            <input
              id="newPassword"
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...passwordForm.register("newPassword", {
                required: "E detyrueshme.",
                minLength: { value: 6, message: "Të paktën 6 karaktere." },
              })}
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          {passwordStatus && (
            <p className={`text-sm ${passwordStatus.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {passwordStatus.text}
            </p>
          )}

          <Button type="submit" variant="secondary" isLoading={passwordForm.formState.isSubmitting}>
            Ndrysho fjalëkalimin
          </Button>
        </form>
      )}
    </div>
  );
}
