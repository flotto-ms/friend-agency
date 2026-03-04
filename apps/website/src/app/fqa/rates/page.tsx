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
import {
  deleteGroup,
  loadInitialRates,
  resetStopped,
  selectRates,
  setRateEnabled,
} from "@/data/rateSlice";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedRows, setSelectedRows] = useState({});

  const dispatch = useAppDispatch();
  const slice = useAppSelector(selectRates);
  const loaded = slice.status === "loaded";

  useEffect(() => {
    if (slice.status !== "init") {
      return;
    }
    dispatch(loadInitialRates(123456));
  }, []);

  const rates = useMemo(() => {
    if (slice.status !== "loaded") {
      return Array(6)
        .fill(1)
        .map((_, i) => ({ id: `tmp_${i}` }) as RateItem);
    }

    return Object.entries(slice.rates)
      .filter(
        ([_, r]) =>
          selectedGroup === "all" || Boolean(r.groups?.includes(selectedGroup)),
      )
      .map(([id, data]) => ({ id, ...data }) as RateItem)
      .sort((a, b) => a.description.localeCompare(b.description));
  }, [slice, selectedGroup]);

  const selectedRateIds = useMemo(() => {
    return Object.keys(selectedRows).map((key) => rates[parseInt(key)].id);
  }, [rates, selectedRows]);

  const onGroupEnable = (enabled: boolean) => {
    rates.forEach((r) => {
      if (r.stopping || r.enabled == enabled) {
        return;
      }
      dispatch(setRateEnabled({ id: r.id, enabled }));
      if (r.enabled) {
        dispatch(resetStopped(r.id));
      }
    });
  };

  const onDeleteConfirm = () => {
    dispatch(deleteGroup(selectedGroup)).then(() => {
      setSelectedGroup("all");
    });
  };

  const onGroupDelete = () => {
    setConfirmDelete(true);
  };

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-[900px] mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-6">Your Rates</h1>

        <RateGroups
          selectedGroupId={selectedGroup}
          selectedRateIds={selectedRateIds}
          onGroupChange={setSelectedGroup}
          onGroupDelete={onGroupDelete}
          onGroupEnable={onGroupEnable}
        />

        <RateTable
          data={rates}
          loading={!loaded}
          onRowSelectionChange={setSelectedRows}
        />

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Stack Group?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the stack group, but not the rates.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={onDeleteConfirm}
              >
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
    </div>
  );
}
