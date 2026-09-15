"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { QuestSearchItem } from "./types";
import { Button } from "@/components/ui/button";
import { CopyCheckIcon, FolderOpen, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import RateStatsTable from "../RateStatsTable";
import { toast } from "sonner";
import { rateStats } from "../RateStatsTable/columns";
import UserLink from "@/components/UserLink";

export const columns: ColumnDef<QuestSearchItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const data = row.original;
      return `L${data.level}${data.elite ? "E" : ""}`;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 5000,
    cell: ({ row }) => {
      const quest = row.original;
      return (
        <Link className="hover:underline" href={`/fqa/search/${encodeURIComponent(String(quest.id))}`}>
          {quest.description}
        </Link>
      );
    },
  },
  {
    id: "ep",
    header: "Points",
    cell: ({ row }) => {
      const data = row.original;
      const ep = data.level * (data.elite ? 3 : 1);
      return `+${ep}`;
    },
  },
  {
    header: "Contractor",
    size: 1000,
    cell: ({ row }) => {
      if (!row.original.username) {
        return "-";
      }
      return <UserLink country={row.original.country} username={row.original.username} id={row.original.id} copyId />;
    },
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ getValue }) => {
      const rate = getValue();
      if (!rate) {
        return "-";
      }
      return (
        <HoverCard openDelay={50} closeDelay={10}>
          <HoverCardTrigger>{`${rate}`}</HoverCardTrigger>
          <HoverCardContent className="p-2 pointer-events-none" side="top">
            <RateStatsTable data={rateStats} />
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const quest = row.original;
      return (
        <Link href={`/fqa/search/${encodeURIComponent(String(quest.id))}`}>
          <Button variant="ghost" className="h-8 w-8 p-0" aria-label="View matching contracts">
            <FolderOpen className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];
