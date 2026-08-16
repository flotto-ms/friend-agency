"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContractCard from "@/components/ContractCard";
import { getQuestDescription } from "@/components/QuestTypeSelect";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import {
  loadActiveContractsAction,
  selectActiveContracts,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import { loadContractorsAction, selectContractors, selectContractorsStatus } from "@/data/contractorsSlice";
import { initSearch, selectSearchQuests, selectSearchStatus } from "@/data/searchSlice";

const formatDate = (value?: string) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function SearchQuestPage() {
  const params = useParams<{ id: string }>();
  const questId = Number(params.id);
  const dispatch = useAppDispatch();
  const activeContracts = useAppSelector(selectActiveContracts);
  const contractors = useAppSelector(selectContractors);
  const activeStatus = useAppSelector(selectActiveContractsStatus);
  const contractorsStatus = useAppSelector(selectContractorsStatus);
  const quests = useAppSelector(selectSearchQuests);
  const searchStatus = useAppSelector(selectSearchStatus);

  useEffect(() => {
    if (activeStatus === "init") {
      dispatch(loadActiveContractsAction());
    }

    if (contractorsStatus === "init") {
      dispatch(loadContractorsAction());
    }

    if (searchStatus === "init") {
      dispatch(initSearch());
    }
  }, [activeStatus, contractorsStatus, searchStatus, dispatch]);

  const selectedQuest = useMemo(() => quests.find((quest) => quest.id === questId), [quests, questId]);

  const cards = useMemo(() => {
    if (!Number.isFinite(questId) || !selectedQuest) {
      return [];
    }

    const byUserId = new Map(contractors.map((contractor) => [contractor.id, contractor]));

    return activeContracts
      .map((contract) => ({
        ...contract,
        contractor: byUserId.get(contract.userId),
      }))
      .filter((contract) => contract.type === selectedQuest.type)
      .filter((contract) => Boolean(contract.contractor))
      .sort((a, b) => {
        if (b.price !== a.price) {
          return b.price - a.price;
        }
        return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      });
  }, [activeContracts, contractors, questId, selectedQuest]);

  if (activeStatus !== "loaded" || contractorsStatus !== "loaded" || searchStatus !== "loaded") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-sm text-muted-foreground">Loading matching contracts...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-4 py-8 font-sans dark:bg-black">
      <main className="w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Quest search</p>
            <h1 className="text-3xl font-semibold">
              {selectedQuest ? getQuestDescription(String(selectedQuest.type)) : "Quest"}
            </h1>
          </div>
          <Link href="/fqa/search" className="text-sm text-primary underline-offset-4 hover:underline">
            Back to search
          </Link>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No matches</CardTitle>
              <CardDescription>There are no active contracts for this quest right now.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <ContractCard key={card.id} contract={card} href={`/fqa/contracts/${encodeURIComponent(card.id)}`} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
