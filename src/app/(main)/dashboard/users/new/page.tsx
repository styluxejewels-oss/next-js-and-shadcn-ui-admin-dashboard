import type { Metadata } from "next";

import { UserForm } from "../_components/user-form";

export const metadata: Metadata = {
  title: "Add user | Studio Admin",
  description: "Create a user account and assign workspace permissions.",
  alternates: {
    canonical: "/dashboard/users/new",
  },
};

export default function Page() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="text-muted-foreground text-sm">Users / Add user</div>
        <h1 className="text-2xl font-semibold tracking-tight">Add a user</h1>
        <p className="max-w-2xl text-muted-foreground">
          Set up an account, choose its workspace access, and prepare an invitation.
        </p>
      </header>
      <UserForm mode="create" />
    </section>
  );
}
