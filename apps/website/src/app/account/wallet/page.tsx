"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { selectAuth } from "@/data/authSlice";
import {
  loadWalletTransactions,
  selectWalletBalance,
  selectWalletStatus,
  selectWalletSummary,
  selectWalletTransactions,
  type WalletTransaction,
} from "@/data/walletSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "@/components/UserSearch";
import { formatNumber } from "@/lib/FormatNumber";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuestTypeSelect from "@/components/QuestTypeSelect";
import { Field, FieldLabel } from "@/components/ui/field";

export default function WalletPage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const transactions = useAppSelector(selectWalletTransactions);
  const status = useAppSelector(selectWalletStatus);
  const summary = useAppSelector(selectWalletSummary);
  const balance = useAppSelector(selectWalletBalance);

  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [questTypeFilter, setQuestTypeFilter] = useState(0);

  useEffect(() => {
    if (auth.status === "authorized" && status === "init") {
      dispatch(loadWalletTransactions());
    }
  }, [auth.status, status, dispatch]);

  const uniqueUsers = useMemo(() => {
    const usersMap = new Map<string, string>();
    transactions.forEach((t) => {
      if (t.username) {
        usersMap.set(t.username, t.country || "xx");
      }
    });
    return Array.from(usersMap.entries())
      .map(([username, country]) => ({ username, country }))
      .sort((a, b) => a.username.localeCompare(b.username));
  }, [transactions]);

  const uniqueStatuses = useMemo(() => {
    return ["Active", "Inactive", "Disputed", "Cancelled", "Auctioned", "Ignored"];
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (filter !== "all") {
      result = result.filter((t) => t.username === filter);
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (questTypeFilter !== 0) {
      result = result.filter((t) => t.type === questTypeFilter);
    }
    return result;
  }, [transactions, filter, statusFilter, questTypeFilter]);

  const filteredSummary = useMemo(() => {
    const received = filteredTransactions
      .filter((transaction) => !transaction.sent)
      .reduce((total, transaction) => {
        return total + transaction.price;
      }, 0);
    const sent = filteredTransactions
      .filter((transaction) => transaction.sent)
      .reduce((total, transaction) => {
        return total + transaction.price;
      }, 0);
    const agencyFees = received * 0.05;
    const net = sent - received - agencyFees;

    return {
      received,
      sent,
      agencyFees,
      net,
    };
  }, [filteredTransactions]);

  if (auth.status === "loading") {
    return (
      <WalletShell>
        <div>Loading wallet...</div>
      </WalletShell>
    );
  }

  if (auth.status !== "authorized") {
    return (
      <WalletShell>
        <Card className="mx-auto w-[350px]">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Please sign in to view your wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserSearch />
          </CardContent>
        </Card>
      </WalletShell>
    );
  }

  return (
    <WalletShell>
      <main className="md:w-[900px] md:mx-auto mx-2">
        <h1 className="text-3xl font-semibold text-center mb-6">Your Wallet</h1>
        <div className="flex flex-col gap-4 mb-4 rounded-lg border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Current balance</div>
            <div className={`text-3xl font-semibold ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatNumber(balance)}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>{formatNumber(transactions.length)} transactions</div>
            <div>{status === "loading" ? "Updating..." : "Up to date"}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Received</div>
            <div className="mt-2 text-xl font-semibold text-rose-600">{formatNumber(filteredSummary.received)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Sent</div>
            <div className="mt-2 text-xl font-semibold text-emerald-600">{formatNumber(filteredSummary.sent)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Agency fees</div>
            <div className="mt-2 text-xl font-semibold text-amber-600">{formatNumber(filteredSummary.agencyFees)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Net</div>
            <div
              className={`mt-2 text-xl font-semibold ${filteredSummary.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}
            >
              {formatNumber(filteredSummary.net)}
            </div>
          </div>
        </div>

        {status === "loading" && transactions.length === 0 ? (
          <div className="text-sm text-muted-foreground">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-sm text-muted-foreground">No transactions yet.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="w-full sm:w-[200px]">
                <Field>
                  <FieldLabel>User</FieldLabel>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map((user) => (
                        <SelectItem key={user.username} value={user.username}>
                          <div className="flex items-center gap-2">
                            {user.country && user.country.toLowerCase() !== "xx" && (
                              <img
                                src={`https://minesweeper.online/img/flags/${user.country.toLowerCase()}.png`}
                                alt={`${user.country} flag`}
                              />
                            )}
                            <span>{user.username}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="w-full sm:w-[200px]">
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {uniqueStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="w-full sm:w-[200px] [&_button]:bg-background">
                <QuestTypeSelect value={questTypeFilter} allowAll onChange={setQuestTypeFilter} />
              </div>
              {(filter !== "all" || statusFilter !== "all" || questTypeFilter !== 0) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFilter("all");
                    setStatusFilter("all");
                    setQuestTypeFilter(0);
                  }}
                  className="text-muted-foreground w-full sm:w-auto"
                >
                  Clear filters
                </Button>
              )}
            </div>
            <WalletTable data={filteredTransactions} />
          </div>
        )}
      </main>
    </WalletShell>
  );
}

const walletColumns: ColumnDef<WalletTransaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {new Date(row.original.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        {row.original.country && row.original.country.toLowerCase() !== "xx" && (
          <img
            src={`https://minesweeper.online/img/flags/${row.original.country.toLowerCase()}.png`}
            alt={`${row.original.country} flag`}
          />
        )}
        {row.original.username || row.original.country || "Unknown"}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate text-muted-foreground sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
        <span className="font-medium text-foreground">
          {`L${row.original.level}${row.original.isElite ? "E" : ""} `}
        </span>
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const isCredit = row.original.sent;
      const amount = isCredit ? row.original.price : -row.original.price;
      return (
        <div className={`text-right font-semibold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
          {formatNumber(amount)}
        </div>
      );
    },
  },
];

const WalletTable: React.FC<{ data: WalletTransaction[] }> = ({ data }) => {
  const table = useReactTable({
    data,
    columns: walletColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border w-full">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={walletColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <div className="text-sm text-muted-foreground flex items-center justify-center min-w-[5rem]">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
};

const WalletShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-zinc-50 px-4 py-8 font-sans dark:bg-black">
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-start">{children}</main>
  </div>
);
