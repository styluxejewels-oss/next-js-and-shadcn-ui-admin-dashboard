import type { Metadata } from "next";

import { users } from "./_components/data";
import { Users } from "./_components/users";

export const metadata: Metadata = {
  title: "Users | Studio Admin",
  description: "Browse, search, and filter organization members by role, team, status, and workspace.",
  alternates: {
    canonical: "/dashboard/users",
  },
};

export default function Page() {
  return <Users users={users} />;
}
