"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { loadContractorsAction, selectContractors, selectContractorsStatus } from "@/data/contractorsSlice";
import {
  loadContractHistoryAction,
  selectContractHistory,
  selectContractHistoryId,
  selectContractHistoryStatus,
} from "@/data/contractHistorySlice";
import { getFilterDescription } from "@/lib/FilterDesc";
import { getQuestDescription } from "@/components/QuestTypeSelect";
import UserLink from "@/components/UserLink";
import ExchangeBadge from "@/components/badges/ExchangeBadge";
import AvailableBadge from "@/components/badges/AvailableBadge";

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

export default function ContractHistoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = decodeURIComponent(String(params?.id ?? ""));
  const dispatch = useAppDispatch();
  const history = useAppSelector(selectContractHistory);
  const historyStatus = useAppSelector(selectContractHistoryStatus);
  const activeContractId = useAppSelector(selectContractHistoryId);
  const contractors = useAppSelector(selectContractors);
  const contractorsStatus = useAppSelector(selectContractorsStatus);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (id && activeContractId !== id) {
      dispatch(loadContractHistoryAction(id));
    }

    if (contractorsStatus === "init") {
      dispatch(loadContractorsAction());
    }
  }, [activeContractId, contractorsStatus, dispatch, id]);

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.startedAt ?? "1970-01-01T00:00:00.000Z").getTime() -
          new Date(a.startedAt ?? "1970-01-01T00:00:00.000Z").getTime(),
      ),
    [history],
  );

  useEffect(() => {
    if (sortedHistory.length === 0) {
      setSelectedId(null);
      return;
    }

    const newestStartedAt = sortedHistory[0].startedAt;
    if (!selectedId || !sortedHistory.some((item) => item.startedAt === selectedId)) {
      setSelectedId(newestStartedAt ?? null);
    }
  }, [selectedId, sortedHistory]);

  const selectedContract = useMemo(
    () => sortedHistory.find((item) => item.startedAt === selectedId) ?? sortedHistory[0] ?? null,
    [selectedId, sortedHistory],
  );

  const contractor = useMemo(
    () => (selectedContract ? contractors.find((person) => person.id === selectedContract.userId) : undefined),
    [contractors, selectedContract],
  );

  if (historyStatus !== "loaded" || contractorsStatus !== "loaded") {
    return (
      <Centered>
        <div>Loading contract history...</div>
      </Centered>
    );
  }

  if (sortedHistory.length === 0) {
    return (
      <Centered>
        <div className="w-full max-w-4xl rounded-lg border bg-card p-12 text-center text-muted-foreground">
          No contract history found for this rate.
        </div>
      </Centered>
    );
  }

  return (
    <Centered>
      <div className="w-full max-w-300">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to active contracts
          </button>
        </div>

        {selectedContract && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <UserLink
                  id={contractor?.id}
                  country={contractor?.country}
                  username={contractor?.username ?? `User ${selectedContract.userId}`}
                  href={`/fqa/participants/${selectedContract.userId}`}
                  copyId
                />
                <AvailableBadge available={contractor?.available} />
              </div>
              <CardDescription>
                Contract history for {getQuestDescription(String(selectedContract.type))}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Quest</span>
                <span className="font-medium text-right">
                  {getQuestDescription(String(selectedContract.type))}
                  {selectedContract.filter && getFilterDescription(selectedContract) && (
                    <span className="text-muted-foreground"> · {getFilterDescription(selectedContract)}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">
                  {selectedContract.preferExchange && <ExchangeBadge className="mr-2" />}
                  {selectedContract.price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-right">{formatDate(selectedContract.startedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ended</span>
                <span className="font-medium text-right">
                  {selectedContract.endedAt === "Active" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      Active
                    </Badge>
                  ) : (
                    formatDate(selectedContract.endedAt)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="w-full overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Rate</TableHead>
                <TableHead>Filter</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Ended At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((row) => {
                const isSelected = row.startedAt === selectedContract?.startedAt;
                const filterText = row.filter ? getFilterDescription(row) : "None";

                return (
                  <TableRow
                    key={`${row.id}-${row.startedAt}`}
                    data-state={isSelected ? "selected" : undefined}
                    className={isSelected ? "bg-muted/50" : "cursor-pointer hover:bg-muted/50"}
                    onClick={() => setSelectedId(row.startedAt)}
                  >
                    <TableCell>
                      {row.price}
                      {row.preferExchange && <ExchangeBadge className="ml-2" />}
                    </TableCell>
                    <TableCell>{filterText}</TableCell>
                    <TableCell>{formatDate(row.startedAt)}</TableCell>
                    <TableCell>
                      {row.endedAt === "Active" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          Active
                        </Badge>
                      ) : (
                        formatDate(row.endedAt)
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
