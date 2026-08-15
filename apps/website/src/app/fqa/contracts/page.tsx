"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "@/components/UserSearch";
import QuestTypeSelect, { getQuestDescription } from "@/components/QuestTypeSelect";
import { getFilterDescription } from "@/lib/FilterDesc";
import { selectAuth } from "@/data/authSlice";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import {
  loadActiveContractsAction,
  selectActiveContracts,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import { loadContractorsAction, selectContractors, selectContractorsStatus } from "@/data/contractorsSlice";

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
  const searchParams = useSearchParams();
  const [questTypeFilter, setQuestTypeFilter] = useState(() => {
    const type = Number(searchParams.get("quest") ?? "0");
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
        return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
      });
  }, [activeContracts, contractors, questTypeFilter]);

  if (activeStatus !== "loaded" || contractorsStatus !== "loaded") {
    return (
      <Centered>
        <div>Loading active contracts...</div>
      </Centered>
    );
  }

  return (
    <Centered>
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Active Contracts</h1>
            <p className="text-sm text-muted-foreground mt-2">Live rates currently in force for contractors.</p>
          </div>
          <div className="flex max-w-sm items-end gap-2">
            <div className="flex-1">
              <QuestTypeSelect value={questTypeFilter} onChange={setQuestTypeFilter} />
            </div>
            {questTypeFilter !== 0 && (
              <button
                type="button"
                aria-label="Clear quest filter"
                onClick={() => setQuestTypeFilter(0)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground transition hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No active contracts right now.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.id} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {card.contractor?.country && (
                        <img
                          src={`https://minesweeper.online/img/flags/${card.contractor.country.toLowerCase()}.png`}
                          alt={`${card.contractor.country} flag`}
                        />
                      )}
                      <CardTitle className="truncate">{card.contractor?.username ?? `User ${card.userId}`}</CardTitle>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${
                        card.contractor?.available
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {card.contractor?.available ? "Available" : "Busy"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Quest</span>
                    <span className="font-medium text-right">
                      {getQuestDescription(String(card.type))}
                      {card.filter && getFilterDescription({ filter: card.filter as any }) && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {getFilterDescription({ filter: card.filter as any })}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{card.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-medium text-right">{formatDate(card.startedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Centered>
  );
}

const Centered: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black py-8">
      <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between py-16 px-8 bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
};
