"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RateStatsItem } from "./types";

export const rateStats: RateStatsItem[] = [
  {
    rate: 250,
    amount: 12,
    lastSale: "3 hours ago",
  },
  {
    rate: 240,
    amount: 27,
    lastSale: "23 mins ago",
  },
  {
    rate: 200,
    amount: 4,
    lastSale: "10 hours ago",
  },
];

export const columns: ColumnDef<RateStatsItem>[] = [
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ getValue }) => `${getValue()} / ❤️`,
  },
  {
    accessorKey: "amount",
    header: "Sales",
  },
  {
    accessorKey: "lastSale",
    header: "Last Sale",
  },
];
