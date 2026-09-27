"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ContractTableItem } from "./types";
import { getQuestDescription } from "@/components/QuestTypeSelect";
import { getFilterDescription } from "@/lib/FilterDesc";
import UserLink from "@/components/UserLink";
import AvailableBadge from "@/components/badges/AvailableBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ExchangeBadge from "@/components/badges/ExchangeBadge";

export const columns: ColumnDef<ContractTableItem>[] = [
  {
    accessorFn: (row) => row.contractor?.username ?? `User ${row.userId}`,
    id: "contractor",
    header: "Contractor",
    cell: ({ row }) => {
      const contractor = row.original.contractor;
      if (!contractor) return <span className="text-muted-foreground">Unknown</span>;
      return (
        <div className="flex gap-2 items-center">
          <UserLink
            id={contractor.id}
            country={contractor.country}
            username={contractor.username ?? `User ${row.original.userId}`}
            href={`/fqa/participants/${contractor.id}`}
            copyId
            openExchange={row.original.preferExchange}
          />
          <AvailableBadge available={contractor.available} />
        </div>
      );
    },
  },
  {
    accessorFn: (row) => getQuestDescription(String(row.type)),
    id: "type",
    header: "Quest",
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <div className="flex flex-row items-center gap-2">
          <Link
            href={`/fqa/contracts/${encodeURIComponent(row.original.id)}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {getQuestDescription(String(contract.type))}
          </Link>
          {contract.filter &&
            getFilterDescription(contract as unknown as { type: number; filter?: Record<string, unknown> }) && (
              <span className="text-xs text-muted-foreground">
                {getFilterDescription(contract as unknown as { type: number; filter?: Record<string, unknown> })}
              </span>
            )}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right w-full">Rate</div>,
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <div className="flex justify-end items-center gap-2">
          {contract.preferExchange && <ExchangeBadge />}
          <span>{contract.price}</span>
        </div>
      );
    },
  },
];
