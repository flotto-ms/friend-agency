"use client";

import type { RateItem } from "./types";

import {
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const RateTable: React.FC<{
  data: RateItem[];
  loading?: boolean;
  onRowSelectionChange?: (state: RowSelectionState) => void;
}> = ({ data, loading = false, onRowSelectionChange }) => {
  const [selection, setSelection] = useState({});

  useEffect(() => {
    setSelection({});
    if (onRowSelectionChange) onRowSelectionChange({});
  }, [data]);

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

  return (
    <div className="overflow-hidden rounded-md border w-full">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.original.id}
                data-state={row.getIsSelected() && "selected"}
              >
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
  );
};

export default RateTable;
