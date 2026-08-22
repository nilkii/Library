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
    <div className="container-page max-w-xl py-14">
      <Head>
        <title>Profile — Libraria</title>
      </Head>

      <h1 className="text-[clamp(28px,4vw,48px)]">Profili im</h1>
      <p className="mt-1.5 text-sm text-muted">{email}</p>

      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
        <h2 className="text-lg font-semibold">Të dhënat e mia</h2>

        <div>
          <label htmlFor="name" className="lib-label">
            Emri
          </label>
          <input
            id="name"
            type="text"
            className="lib-input"
            {...profileForm.register("name", { required: "Emri është i detyrueshëm.", minLength: { value: 2, message: "Të paktën 2 karaktere." } })}
          />
          {profileForm.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image" className="lib-label">
            URL e fotos (opsionale)
          </label>
          <input id="image" type="url" placeholder="https://..." className="lib-input" {...profileForm.register("image")} />
        </div>

        {profileStatus && (
          <p className={`text-sm ${profileStatus.type === "success" ? "" : "text-red-600"}`} style={profileStatus.type === "success" ? { color: "var(--ok)" } : undefined}>
            {profileStatus.text}
          </p>
        )}

        <div>
          <Button type="submit" isLoading={profileForm.formState.isSubmitting}>
            Ruaj ndryshimet
          </Button>
        </div>
      </form>

      {provider === "credentials" && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-12 flex flex-col gap-4 border-t pt-8" style={{ borderColor: "var(--line)" }} noValidate>
          <h2 className="text-lg font-semibold">Ndrysho fjalëkalimin</h2>

          <div>
            <label htmlFor="currentPassword" className="lib-label">
              Fjalëkalimi aktual
            </label>
            <input id="currentPassword" type="password" className="lib-input" {...passwordForm.register("currentPassword", { required: "E detyrueshme." })} />
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="lib-label">
              Fjalëkalimi i ri
            </label>
            <input
              id="newPassword"
              type="password"
              className="lib-input"
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
            <p className={`text-sm ${passwordStatus.type === "success" ? "" : "text-red-600"}`} style={passwordStatus.type === "success" ? { color: "var(--ok)" } : undefined}>
              {passwordStatus.text}
            </p>
          )}

          <div>
            <Button type="submit" variant="ghost" isLoading={passwordForm.formState.isSubmitting}>
              Ndrysho fjalëkalimin
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
