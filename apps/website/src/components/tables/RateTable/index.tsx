"use client";

import type { RateItem } from "./types";

import { flexRender, getCoreRowModel, RowSelectionState, useReactTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { generateColumns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";

const RateTable: React.FC<{
  data: RateItem[];
  loading?: boolean;
  onRowSelectionChange?: (state: RowSelectionState) => void;
  onRowDelete?: (id: string) => void;
}> = ({ data, loading = false, onRowSelectionChange, onRowDelete }) => {
  const [selection, setSelection] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const columns = generateColumns(onRowDelete);

  useEffect(() => {
    setSelection({});
    if (onRowSelectionChange) onRowSelectionChange({});
  }, [data]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = () => {
      console.log("isMobile", mediaQuery.matches);
      setIsMobile(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (updateFunction) => {
      let changes: RowSelectionState | undefined = undefined;

      setSelection((old) => {
        if (typeof updateFunction === "object") {
          changes = updateFunction;
          return updateFunction;
        } else {
          const state = updateFunction(old);
          changes = state;
          return state;
        }
      });

      if (onRowSelectionChange && changes) onRowSelectionChange(changes);
    },
    state: {
      rowSelection: selection,
    },
  });

  const mobileRows = table.getRowModel().rows;

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-hidden rounded-md border">
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
                <TableRow key={row.original.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} width={cell.column.columnDef.size}>
                      {loading ? (
                        <div className="h-9 flex items-center">
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  There are no rates in this group.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isMobile && (
        <div className="block space-y-3 md:hidden">
          {mobileRows.length ? (
            mobileRows.map((row) => {
              const cells = (row.getVisibleCells?.() ?? []).filter(
                (cell) => !!cell && !!cell.column && cell.column.id !== "select",
              );

              const descriptionCell = cells.find((cell) => cell.column.id === "description");
              const filterCell = cells.find((cell) => cell.column.id === "filter");
              const rateCell = cells.find((cell) => cell.column.id === "rate");
              const statusCell = cells.find((cell) => cell.column.id === "status");
              const enabledCell = cells.find((cell) => cell.column.id === "enabled");
              const actionsCell = cells.find((cell) => cell.column.id === "actions");

              return (
                <div
                  key={row.original.id}
                  className={`rounded-lg border bg-card p-3 shadow-sm ${row.getIsSelected() ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {loading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <div className="text-base font-medium">
                          <div className="flex flex-wrap items-center gap-2">
                            {descriptionCell &&
                              flexRender(descriptionCell.column.columnDef.cell, descriptionCell.getContext())}
                            {filterCell && (
                              <span className="text-sm text-muted-foreground">
                                {flexRender(filterCell.column.columnDef.cell, filterCell.getContext())}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {actionsCell && (
                      <div className="shrink-0">
                        {flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
                      </div>
                    )}
                  </div>

                  {(statusCell || enabledCell || rateCell) && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-muted/60 px-2 py-2">
                      {rateCell && (
                        <div className="text-sm">
                          {flexRender(rateCell.column.columnDef.cell, rateCell.getContext())}
                        </div>
                      )}

                      {statusCell && (
                        <div className="min-w-0">
                          <div className="mt-1">
                            {flexRender(statusCell.column.columnDef.cell, statusCell.getContext())}
                          </div>
                        </div>
                      )}
                      {enabledCell && (
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Enabled
                          </span>
                          {flexRender(enabledCell.column.columnDef.cell, enabledCell.getContext())}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
              There are no rates in this group.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RateTable;
