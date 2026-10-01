"use client";

import type { QuestSearchItem } from "./types";

import { flexRender, getCoreRowModel, RowSelectionState, useReactTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { columns } from "./columns";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch } from "@/data/hooks";
import { deleteQuests, initSearch } from "@/data/searchSlice";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Field, FieldContent, FieldLabel, FieldTitle } from "@/components/ui/field";
import { useEffect, useState } from "react";

const QuestSearchTable: React.FC<{
  data: QuestSearchItem[];
  hideExchangeOnly: boolean;
  onChangeHideExchangeOnly: (value: boolean) => void;
}> = ({ data, hideExchangeOnly, onChangeHideExchangeOnly }) => {
  const dispatch = useAppDispatch();
  const [selection, setSelection] = useState({});

  useEffect(() => {
    setSelection({});
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
    },
    state: {
      rowSelection: selection,
    },
  });

  const onReload = () => {
    dispatch(initSearch());
  };

  const onDelete = () => {
    const toDelete = Object.keys(selection).map((i) => data[i].id);
    dispatch(deleteQuests(toDelete));
  };

  return (
    <div className="w-full max-w-300">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Available Quests</h1>
          <p className="text-sm text-muted-foreground mt-2">Match your quests with available contractors.</p>
        </div>
        <div className="flex max-w-sm items-end  gap-2">
          <div className="flex-1 min-w-[250px]">
            {(table.getRowModel().rows?.length ?? 0) > 0 && (
              <FieldLabel htmlFor="switch-exchange-mode">
                <Field orientation="horizontal" className="max-w-sm">
                  <FieldContent>
                    <FieldTitle>Hide Exhange Only</FieldTitle>
                  </FieldContent>
                  <Switch
                    id="switch-exchange-mode"
                    checked={hideExchangeOnly}
                    onClick={() => onChangeHideExchangeOnly(!hideExchangeOnly)}
                  />
                </Field>
              </FieldLabel>
            )}
          </div>
        </div>
      </div>

      {table.getRowModel().rows?.length ? (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
          <Button
            disabled={Object.keys(selection).length === 0}
            variant="secondary"
            className="mt-6"
            onClick={onDelete}
          >
            <Trash2 /> Remove Selected
          </Button>
        </>
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
