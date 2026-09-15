"use client";

import type { QuestSearchItem } from "./types";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { columns } from "./columns";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch } from "@/data/hooks";
import { initSearch } from "@/data/searchSlice";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const QuestSearchTable: React.FC<{ data: QuestSearchItem[] }> = ({ data }) => {
  const dispatch = useAppDispatch();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onReload = () => {
    dispatch(initSearch());
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-6">Available Quests</h1>

      {table.getRowModel().rows?.length ? (
        <div className="overflow-hidden rounded-md border">
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
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} width={cell.column.columnDef.size}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="mb-6 max-md:hidden">
          <CardHeader>
            <CardTitle>No Quests</CardTitle>
            <CardDescription>
              <p>
                Either all quests have been sent for today, or you need to sign in to MSO to generate todays quests.
              </p>
              <Button variant="secondary" className="mt-6" onClick={onReload}>
                <RefreshCw /> Reload Quests
              </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default QuestSearchTable;
