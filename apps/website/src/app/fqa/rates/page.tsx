"use client";

import RateDraw from "@/components/draws/RateDraw";
import RateTable from "@/components/tables/RateTable";
import { RateItem } from "@/components/tables/RateTable/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { loadInitialRates, selectRates } from "@/data/rateSlice";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [selectedGroup, setSelectedGroup] = useState("all");

  const slice = useAppSelector(selectRates);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (slice.status !== "init") {
      return;
    }
    dispatch(loadInitialRates(123456));
  }, []);

  const { groups, rates } = useMemo(() => {
    if (slice.status !== "loaded") {
      return {
        groups: [],
        rates: Array(6)
          .fill(1)
          .map((_, i) => ({ id: `tmp_${i}` }) as RateItem),
      };
    }

    const countGroups = (id: string) => {
      return Object.values(slice.rates).filter((r) =>
        Boolean(r.groups?.includes(id)),
      ).length;
    };

    return {
      groups: Object.entries(slice.groups).map(([id, data]) => ({
        id,
        ...data,
        rates: countGroups(id),
      })),
      rates: Object.entries(slice.rates)
        .filter(
          ([_, r]) =>
            selectedGroup === "all" ||
            Boolean(r.groups?.includes(selectedGroup)),
        )
        .map(([id, data]) => ({ id, ...data }) as RateItem),
    };
  }, [slice, selectedGroup]);

  const loaded = slice.status === "loaded";

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="max-w-[900px] mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-6">Your Rates</h1>
        <Tabs
          value={selectedGroup}
          onValueChange={setSelectedGroup}
          className="mb-6"
        >
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="all">All</TabsTrigger>
            {loaded ? (
              groups.map((group) => (
                <TabsTrigger key={group.id} value={group.id}>
                  {group.label} <Badge variant="secondary">{group.rates}</Badge>
                </TabsTrigger>
              ))
            ) : (
              <Spinner className="mx-4" />
            )}
          </TabsList>
        </Tabs>

        <RateTable data={rates} loading={!loaded} />

        <RateDraw>
          <Button disabled={!loaded} variant="secondary" className="mt-6">
            <Plus /> New Rate
          </Button>
        </RateDraw>
      </main>
    </div>
  );
}
