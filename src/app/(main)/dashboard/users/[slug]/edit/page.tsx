import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { users } from "../../_components/data";
import { UserForm } from "../../_components/user-form";

export const metadata: Metadata = {
  title: "Edit user | Studio Admin",
  description: "Edit a user's profile, role, workspace access, and account status.",
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = users.find((item) => toSlug(item.name) === slug);

  if (!user) {
    notFound();
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="text-muted-foreground text-sm">Users / Edit user</div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit user</h1>
        <p className="max-w-2xl text-muted-foreground">
          Update {user.name}&apos;s profile, permissions, and account status.
        </p>
      </header>
      <UserForm initialUser={user} mode="edit" />
    </section>
  );
}
