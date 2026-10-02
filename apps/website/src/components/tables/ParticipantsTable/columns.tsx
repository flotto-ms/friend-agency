"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ParticipantItem } from "./types";
import UserLink from "@/components/UserLink";
import AvailableBadge from "@/components/badges/AvailableBadge";
import { Gem } from "lucide-react";

export const columns: ColumnDef<ParticipantItem>[] = [
  {
    accessorKey: "hasExtension",
    header: () => <Gem className="w-4 h-6" />,
    size: 1,
    cell: ({ row }) => (row.original.hasExtension ? <Gem className="w-4 h-6" /> : null),
  },
  {
    accessorKey: "id",
    header: "Username",
    size: 500,
    cell: ({ row }) => {
      return (
        <UserLink
          href={`/fqa/participants/${row.original.id}`}
          country={row.original.country}
          username={row.original.username}
          id={row.original.id}
          copyId
        />
      );
    },
  },
  {
    accessorKey: "available",
    header: "Availability",
    size: 100,
    cell: ({ row }) => {
      return <AvailableBadge available={row.original.available} />;
    },
  },
  {
    accessorKey: "slots",
    header: () => <div className="text-center">Slots</div>,
    size: 120,
    cell: ({ row }) => (
      <div className="text-center">{row.original.hasExtension ? (row.original.slots ?? 0) + " / 10" : "—"} </div>
    ),
  },
];
