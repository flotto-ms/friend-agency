"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { ParticipantItem } from "./types";
import UserLink from "@/components/UserLink";
import AvailableBadge from "@/components/badges/AvailableBadge";

export const columns: ColumnDef<ParticipantItem>[] = [
  {
    accessorKey: "id",
    header: "Username",
    cell: ({ row }) => {
      return (
        <UserLink
          href={`https://minesweeper.online/player/${row.original.id}`}
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
    size: 80,
    cell: ({ row }) => {
      return <AvailableBadge available={row.original.available} />;
    },
  },
  {
    accessorKey: "slots",
    header: "Slots",
    size: 60,
    cell: ({ row }) => {
      return (row.original.slots ?? 0) + " / 10";
    },
  },
];
