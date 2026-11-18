"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";

import { ArrowLeft, Check, MailPlus, ShieldCheck, UserRoundPlus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { filters, type UserRow, type UserStatus } from "./data";

const roles = filters.role.filter((role) => role !== "All");
const teams = filters.team.filter((team) => team !== "All");
const workspaces = filters.workspace.filter((workspace) => workspace !== "All");
const statuses: UserStatus[] = ["Active", "Pending invite", "Deactivated", "Locked", "Suspended"];

type UserFormValues = {
  name: string;
  email: string;
  role: string;
  team: string;
  status: UserStatus;
  workspaces: string[];
};

type UserFormProps = {
  mode: "create" | "edit";
  initialUser?: UserRow;
};

export function UserForm({ mode, initialUser }: UserFormProps) {
  const isEditing = mode === "edit";
  const [values, setValues] = useState<UserFormValues>(() => ({
    name: initialUser?.name ?? "",
    email: initialUser?.email ?? "",
    role: initialUser?.role ?? "Contributor",
    team: initialUser?.team ?? "Platform",
    status: initialUser?.status ?? "Pending invite",
    workspaces: initialUser?.workspace ?? ["Weblabs Studio"],
  }));
  const [sendInvite, setSendInvite] = useState(!isEditing);
  const [confirmation, setConfirmation] = useState("");
  const initials = values.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function updateValue<Key extends keyof UserFormValues>(key: Key, value: UserFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setConfirmation("");
  }

  function toggleWorkspace(workspace: string, checked: boolean) {
    setValues((current) => ({
      ...current,
      workspaces: checked
        ? [...current.workspaces, workspace]
        : current.workspaces.filter((item) => item !== workspace),
    }));
    setConfirmation("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmation(
      isEditing
        ? `Changes for ${values.name} are saved in this preview only.`
        : `The invitation for ${values.email} is ready in this preview. No email was sent.`,
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <form className="flex min-w-0 flex-col gap-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Personal information</CardTitle>
            <CardDescription>Use the name and email address this person will use to sign in.</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <FieldGroup className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="user-name">Full name</FieldLabel>
                <Input
                  autoComplete="name"
                  id="user-name"
                  onChange={(event) => updateValue("name", event.target.value)}
                  placeholder="e.g. Jordan Lee"
                  required
                  value={values.name}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="user-email">Email address</FieldLabel>
                <Input
                  autoComplete="email"
                  id="user-email"
                  onChange={(event) => updateValue("email", event.target.value)}
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={values.email}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Access and permissions</CardTitle>
            <CardDescription>Choose the role and spaces this account can access.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-1">
            <FieldGroup className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="user-role">Role</FieldLabel>
                <Select onValueChange={(value) => updateValue("role", value)} value={values.role}>
                  <SelectTrigger className="w-full" id="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Roles define what this person can view and manage.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="user-team">Team</FieldLabel>
                <Select onValueChange={(value) => updateValue("team", value)} value={values.team}>
                  <SelectTrigger className="w-full" id="user-team">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldSet className="gap-3">
              <FieldLegend variant="label">Workspaces</FieldLegend>
              <div className="grid gap-2 sm:grid-cols-2">
                {workspaces.map((workspace) => {
                  const checked = values.workspaces.includes(workspace);
                  const checkboxId = `workspace-${workspace.toLowerCase().replaceAll(" ", "-")}`;

                  return (
                    <FieldLabel key={workspace} htmlFor={checkboxId}>
                      <Field orientation="horizontal" className="items-center rounded-lg border p-3">
                        <Checkbox
                          checked={checked}
                          id={checkboxId}
                          onCheckedChange={(value) => toggleWorkspace(workspace, value === true)}
                        />
                        <FieldContent>
                          <span className="text-sm font-medium">{workspace}</span>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  );
                })}
              </div>
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Account status</CardTitle>
            <CardDescription>Choose whether this account is active, invited, or restricted.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-1">
            <Field>
              <FieldLabel htmlFor="user-status">Status</FieldLabel>
              <Select onValueChange={(value) => updateValue("status", value as UserStatus)} value={values.status}>
                <SelectTrigger className="w-full md:max-w-sm" id="user-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>Pending invite is the default for new accounts.</FieldDescription>
            </Field>
            <FieldLabel>
              <Field orientation="horizontal" className="items-center justify-between rounded-lg border p-3">
                <FieldContent>
                  <span className="text-sm font-medium">Send invitation email</span>
                  <FieldDescription>
                    {isEditing
                      ? "Send a fresh invite link to this user."
                      : "Prepare an invite for the email address above."}
                  </FieldDescription>
                </FieldContent>
                <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
              </Field>
            </FieldLabel>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <Button asChild type="button" variant="outline">
              <Link href="/dashboard/users">
                <ArrowLeft data-icon="inline-start" />
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              {isEditing ? <Check data-icon="inline-start" /> : <MailPlus data-icon="inline-start" />}
              {isEditing ? "Save changes" : "Create user"}
            </Button>
          </CardFooter>
        </Card>

        <p aria-live="polite" className="text-sm text-muted-foreground" role="status">
          {confirmation}
        </p>
      </form>

      <aside className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Access summary</CardTitle>
            <CardDescription>Review the account setup before saving.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-1">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials || <UserRoundPlus />}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{values.name || "New user"}</p>
                <p className="text-muted-foreground truncate text-sm">{values.email || "name@company.com"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{values.role}</Badge>
              <Badge variant="outline">{values.status}</Badge>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <ShieldCheck className="mt-0.5 text-muted-foreground" />
              <span>
                {values.team} team · {values.workspaces.length}{" "}
                {values.workspaces.length === 1 ? "workspace" : "workspaces"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="flex flex-col gap-3 pt-1">
            <div className="flex items-center gap-2 font-medium">
              <MailPlus className="text-muted-foreground" />
              {isEditing ? "Edit workflow" : "Need to edit someone?"}
            </div>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Update a person's role, team, workspace access, or account status here."
                : "Open a sample profile to review the separate user editing workflow."}
            </p>
            {isEditing ? null : (
              <Button asChild className="w-fit" size="sm" variant="outline">
                <Link href="/dashboard/users/olivia-rhye/edit">Edit sample user</Link>
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              This preview does not connect to an account directory or send email.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
