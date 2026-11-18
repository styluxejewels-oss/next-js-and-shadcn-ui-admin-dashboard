"use client";
import * as React from "react";

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Download, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataTableFeatures } from "@/lib/data-table-features";

import { filters, type UserRow } from "./data";
import { usersColumns } from "./users-columns";
import { UsersTable } from "./users-table";

const configurableColumns = [
  { id: "role", label: "Role" },
  { id: "team", label: "Team" },
  { id: "workspace", label: "Workspace" },
  { id: "status", label: "Status" },
  { id: "joinedDate", label: "Joined date" },
] as const;

function exportUsers(rows: UserRow[]) {
  const headers = ["Name", "Email", "Role", "Team", "Workspace", "Status", "Joined date"];
  const escapeCell = (value: string) => {
    const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replaceAll('"', '""')}"`;
  };
  const csv = [
    headers,
    ...rows.map((user) => [
      user.name,
      user.email,
      user.role,
      user.team,
      user.workspace.join("; "),
      user.status,
      user.joinedDate,
    ]),
  ]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "users.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function Users({ users }: { users: UserRow[] }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "joinedDate", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({
    search: false,
    team: false,
  });
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useTable({
    features: dataTableFeatures,
    data: users,
    columns: usersColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    getRowId: (row) => row.email,
    autoResetPageIndex: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string | undefined) ?? "";
  const roleFilter = (table.getColumn("role")?.getFilterValue() as string | undefined) ?? filters.role[0];
  const teamFilter = (table.getColumn("team")?.getFilterValue() as string | undefined) ?? filters.team[0];
  const statusFilter = (table.getColumn("status")?.getFilterValue() as string | undefined) ?? filters.status[0];
  const workspaceFilter =
    (table.getColumn("workspace")?.getFilterValue() as string | undefined) ?? filters.workspace[0];
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const visibleRowCount = table.getRowModel().rows.length;
  const firstVisibleRow = filteredCount ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const lastVisibleRow = filteredCount ? firstVisibleRow + visibleRowCount - 1 : 0;
  const activeFilterCount = [
    searchQuery,
    roleFilter !== "All",
    teamFilter !== "All",
    statusFilter !== "All",
    workspaceFilter !== "All",
  ].filter(Boolean).length;

  function setColumnSelectFilter(columnId: string, value: string) {
    table.getColumn(columnId)?.setFilterValue(value === "All" ? undefined : value);
    table.setPageIndex(0);
  }

  function resetFilters() {
    table.resetColumnFilters();
    table.setPageIndex(0);
    table.resetRowSelection();
  }

  function handleExport() {
    const rows = selectedCount
      ? selectedRows.map((row) => row.original)
      : table.getFilteredRowModel().rows.map((row) => row.original);
    exportUsers(rows);
  }

  return (
    <Card>
      <CardHeader className="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <CardTitle className="text-xl leading-none">Users</CardTitle>
        <CardDescription className="max-w-sm leading-snug">
          Browse members and narrow the list by role, team, status, or workspace.
        </CardDescription>
        <CardAction className="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end">
          <InputGroup className="h-7 w-full md:w-64">
            <InputGroupAddon align="inline-start">
              <Search data-icon="inline-start" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-7"
              type="search"
              aria-label="Search users by name, email, role, team, or workspace"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </InputGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Customize visible columns">
                <SlidersHorizontal data-icon="inline-start" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              {configurableColumns.map(({ id, label }) => {
                const column = table.getColumn(id);
                return column ? (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) => column.toggleVisibility(checked)}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ) : null;
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredCount === 0}>
            <Download data-icon="inline-start" />
            {selectedCount ? `Export selected (${selectedCount})` : "Export results"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={roleFilter} onValueChange={(value) => setColumnSelectFilter("role", value)}>
              <SelectTrigger size="sm" aria-label="Filter by role" className="shrink-0">
                <span className="text-muted-foreground">Role:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {filters.role.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={teamFilter} onValueChange={(value) => setColumnSelectFilter("team", value)}>
              <SelectTrigger size="sm" aria-label="Filter by team" className="shrink-0">
                <span className="text-muted-foreground">Team:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {filters.team.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setColumnSelectFilter("status", value)}>
              <SelectTrigger size="sm" aria-label="Filter by status" className="shrink-0">
                <span className="text-muted-foreground">Status:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {filters.status.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Select value={workspaceFilter} onValueChange={(value) => setColumnSelectFilter("workspace", value)}>
            <SelectTrigger size="sm" aria-label="Filter by workspace" className="shrink-0">
              <span className="text-muted-foreground">Workspace:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectGroup>
                {filters.workspace.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
            Showing {firstVisibleRow}–{lastVisibleRow} of {filteredCount} users
            {selectedCount > 0 ? ` · ${selectedCount} selected` : ""}
          </div>
        </div>

        <UsersTable table={table} onReset={resetFilters} />
      </CardContent>
    </Card>
  );
}
