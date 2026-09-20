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
          <div>Loading active contracts...</div>
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
  const [page, setPage] = useState(0);
  const pageSize = 12;
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

  const totalPages = Math.ceil(cards.length / pageSize);
  const paginatedCards = cards.slice(page * pageSize, (page + 1) * pageSize);

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
            <div className="flex-1 min-w-[250px]">
              <QuestTypeSelect
                allowAll
                value={questTypeFilter}
                onChange={(v) => {
                  setQuestTypeFilter(v);
                  setPage(0);
                }}
              />
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No active contracts right now.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedCards.map((card) => (
                <ContractCard key={card.id} contract={card} href={`/fqa/contracts/${encodeURIComponent(card.id)}`} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, cards.length)} of {cards.length}{" "}
                  contracts
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Centered>
  );
}

const Centered: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black py-8">
      <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between px-8 bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
};
