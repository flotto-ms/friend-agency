"use client";

import RateDraw from "@/components/draws/RateDraw";
import RateGroups from "@/components/RateGroups";
import RateTable from "@/components/tables/RateTable";
import { RateItem } from "@/components/tables/RateTable/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { deleteGroup, deleteRate, loadInitialRates, resetStopped, selectRates, setRateEnabled } from "@/data/rateSlice";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const RateEditor: React.FC = () => {
  const [confirmDelete, setConfirmDelete] = useState<"group" | "rate" | undefined>();
  const [deleteRateId, setDeleteRateId] = useState<string>();
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedRows, setSelectedRows] = useState({});

  const dispatch = useAppDispatch();
  const slice = useAppSelector(selectRates);
  const loaded = slice.status === "loaded";

  useEffect(() => {
    if (slice.status !== "init") {
      return;
    }
    dispatch(loadInitialRates());
  }, []);

  const rates = useMemo(() => {
    if (slice.status !== "loaded") {
      return Array(6)
        .fill(1)
        .map((_, i) => ({ id: `tmp_${i}` }) as RateItem);
    }

    return Object.entries(slice.rates)
      .filter(([_, r]) => selectedGroup === "all" || Boolean(r.groups?.includes(selectedGroup)))
      .map(([id, data]) => ({ id, ...data }) as RateItem)
      .sort((a, b) => a.description.localeCompare(b.description));
  }, [slice, selectedGroup]);

  const selectedRateIds = useMemo(() => {
    return Object.keys(selectedRows).map((key) => rates[parseInt(key)].id);
  }, [rates, selectedRows]);

  const onGroupEnable = (enabled: boolean) => {
    rates.forEach((r) => {
      if (r.enabled == enabled) {
        return;
      }
      dispatch(setRateEnabled({ id: r.id, enabled }));
      if (r.enabled) {
        dispatch(resetStopped(r.id));
      }
    });
  };

  const onDeleteConfirm = () => {
    if (confirmDelete === "group") {
      dispatch(deleteGroup(selectedGroup)).then(() => {
        setSelectedGroup("all");
      });
    } else {
      dispatch(deleteRate(deleteRateId!));
    }
  };

  const onGroupDelete = () => {
    setConfirmDelete("group");
  };

  const onRateDelete = (id: string) => {
    setDeleteRateId(id);
    setConfirmDelete("rate");
  };

  return (
    <main className="md:w-[900px] md:mx-auto mx-2">
      <h1 className="text-3xl font-semibold text-center mb-6">Your Rates</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tip</CardTitle>
          <CardDescription>
            <p>
              Group rates by seelcting rows and clicking the + button from the group selector below...{" "}
              {Object.keys(slice.groups).length === 0 && `(currently only shows 'all' as you have not created any yet)`}
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
      <RateGroups
        selectedGroupId={selectedGroup}
        selectedRateIds={selectedRateIds}
        onGroupChange={setSelectedGroup}
        onGroupDelete={onGroupDelete}
        onGroupEnable={onGroupEnable}
      />

      <RateTable data={rates} loading={!loaded} onRowSelectionChange={setSelectedRows} onRowDelete={onRateDelete} />

      <AlertDialog open={Boolean(confirmDelete)} onOpenChange={() => setConfirmDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete === "group" ? "Stack Group" : "Rate"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete === "group"
                ? "This will remove the stack group, but not the rates."
                : "Delete this rate and cancel any active contract."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RateDraw selectedGroup={selectedGroup}>
        <Button disabled={!loaded} variant="secondary" className="mt-6">
          <Plus /> New Rate
        </Button>
      </RateDraw>
    </main>
  );
};

export default RateEditor;
