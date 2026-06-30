"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RateItem } from "./types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import RateDraw from "@/components/draws/RateDraw";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import RateStatsTable from "../RateStatsTable";
import { rateStats } from "../RateStatsTable/columns";
import { useAppDispatch } from "@/data/hooks";
import { resetStopped, setRateEnabled } from "@/data/rateSlice";

export const generateColumns = (onRateDelete?: (id: string) => void) => {
  const columns: ColumnDef<RateItem>[] = [
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
      accessorKey: "description",
      header: "Description",
      size: 5000,
      cell: ({ getValue, row }) => (
        <RateDraw rate={row.original}>
          <Button variant="link" className="px-0" id={`rate-${row.original.id}`}>{`${getValue()}`}</Button>
        </RateDraw>
      ),
    },
    {
      accessorKey: "filter",
      header: "Filter",
      size: 2500,
    },
    {
      id: "status",
      header: () => <div className="text-center">Status </div>,
      cell: ({ row }) => (
        <div className="flex flex-col items-center">
          <RateStatus rate={row.original} />
        </div>
      ),
    },
    {
      id: "enabled",
      header: () => <div className="text-center">Enabled </div>,
      cell: ({ row }) => <RateSwitcher rate={row.original} />,
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ getValue }) => (
        <HoverCard openDelay={50} closeDelay={10}>
          <HoverCardTrigger>{`${getValue()}`}</HoverCardTrigger>
          <HoverCardContent className="p-2 pointer-events-none" side="top">
            <RateStatsTable data={rateStats} />
          </HoverCardContent>
        </HoverCard>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const rate = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right">
              <DropdownMenuItem onClick={(e) => document.getElementById(`rate-${rate.id}`)?.click()}>
                Edit
              </DropdownMenuItem>
              <Separator />
              {onRateDelete && (
                <DropdownMenuItem variant="destructive" onClick={() => onRateDelete(rate.id)}>
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const RateStatus: React.FC<{ rate: RateItem }> = ({ rate }) => {
    if (rate.stopping) {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
          <Spinner data-icon="inline-start" />
          Stopping
        </Badge>
      );
    }

    if (rate.enabled) {
      return <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">Subscribed</Badge>;
    }
    return <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">Unsubscribed</Badge>;
  };

  const RateSwitcher: React.FC<{ rate: RateItem }> = ({ rate }) => {
    const dispatch = useAppDispatch();
    const onClick = () => {
      dispatch(setRateEnabled({ id: rate.id, enabled: !rate.enabled }));
      if (rate.enabled) {
        dispatch(resetStopped(rate.id));
      }
    };

    return (
      <div className="w-[85px] flex items-center justify-center">
        <Switch checked={rate.enabled} onClick={onClick} />
      </div>
    );
  };

  return columns;
};
