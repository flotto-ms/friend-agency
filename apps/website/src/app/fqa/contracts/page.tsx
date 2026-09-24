"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ContractCard from "@/components/ContractCard";
import QuestTypeSelect from "@/components/QuestTypeSelect";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import {
  loadActiveContractsAction,
  selectActiveContracts,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import { loadContractorsAction, selectContractors, selectContractorsStatus } from "@/data/contractorsSlice";
import ContractList from "@/components/lists/ContractList";

const formatDate = (value?: string) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(navigator.language, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function ContractsPage() {
  return (
    <Suspense
      fallback={
        <Centered>
          <div>Loading offers...</div>
        </Centered>
      }
    >
      <ContractsPageContent />
    </Suspense>
  );
}

function ContractsPageContent() {
  const searchParams = useSearchParams();
  const [questTypeFilter, setQuestTypeFilter] = useState(() => {
    const type = Number(searchParams.get("type") ?? "0");
    return Number.isFinite(type) && type > 0 ? type : 0;
  });
  const dispatch = useAppDispatch();
  const activeContracts = useAppSelector(selectActiveContracts);
  const contractors = useAppSelector(selectContractors);
  const activeStatus = useAppSelector(selectActiveContractsStatus);
  const contractorsStatus = useAppSelector(selectContractorsStatus);

  useEffect(() => {
    if (activeStatus === "init") {
      dispatch(loadActiveContractsAction());
    }

    if (contractorsStatus === "init") {
      dispatch(loadContractorsAction());
    }
  }, [activeStatus, contractorsStatus, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (questTypeFilter === 0) {
      params.delete("type");
    } else {
      params.set("type", String(questTypeFilter));
    }

    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", next);
  }, [questTypeFilter]);

  const cards = useMemo(() => {
    const byUserId = new Map(contractors.map((contractor) => [contractor.id, contractor]));

    return activeContracts
      .map((contract) => ({
        ...contract,
        contractor: byUserId.get(contract.userId),
      }))
      .filter((contract) => Boolean(contract.contractor))
      .filter((contract) => (questTypeFilter === 0 ? true : contract.type === questTypeFilter))
      .sort((a, b) => {
        if (b.price !== a.price) {
          return b.price - a.price;
        }
        if (b.type !== a.type) {
          return b.type - a.type;
        }
        return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
      });
  }, [activeContracts, contractors, questTypeFilter]);

  if (activeStatus !== "loaded" || contractorsStatus !== "loaded") {
    return (
      <Centered>
        <div>Loading current offers...</div>
      </Centered>
    );
  }

  return (
    <Centered>
      <div className="w-full max-w-300">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Current Offers</h1>
            <p className="text-sm text-muted-foreground mt-2">Current offers available by our contractors.</p>
          </div>
          <div className="flex max-w-sm items-end gap-2">
            <div className="flex-1 min-w-[250px]">
              <QuestTypeSelect allowAll value={questTypeFilter} onChange={(v) => setQuestTypeFilter(v)} />
            </div>
          </div>
        </div>

        <ContractList cards={cards} />
      </div>
    </Centered>
  );
}

const Centered: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-12 px-8 bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
};
