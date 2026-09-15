"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { ParticipantItem } from "./types";
import UserLink from "@/components/UserLink";

export const columns: ColumnDef<ParticipantItem>[] = [
  {
    accessorKey: "id",
    header: "Username",
    cell: ({ row }) => {
      return <UserLink country={row.original.country} username={row.original.username} id={row.original.id} copyId />;
    },
  },
];
