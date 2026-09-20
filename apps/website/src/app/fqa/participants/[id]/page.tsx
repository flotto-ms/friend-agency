"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContractCard from "@/components/ContractCard";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import {
  loadActiveContractsAction,
  selectActiveContracts,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import AvailableBadge from "@/components/badges/AvailableBadge";
import UserLink from "@/components/UserLink";
import { getType } from "@/data/authSlice";

type UserSummary = {
  id: number;
  username: string;
  country: string;
  available?: boolean;
  access?: string;
  slots?: number;
};

export default function ParticipantPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const activeContracts = useAppSelector(selectActiveContracts);
  const activeStatus = useAppSelector(selectActiveContractsStatus);

  useEffect(() => {
    if (!user || user.access !== "contractor") {
      return;
    }

    if (activeStatus === "init") {
      dispatch(loadActiveContractsAction());
    }
  }, [activeStatus, dispatch, user]);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;

    api.user
      .get(String(id))
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        console.error("Failed to load user", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const userContracts = useMemo(() => {
    return activeContracts
      .filter((contract) => contract.userId === id)
      .map((contract) => ({
        ...contract,
        contractor: user ? { ...user } : undefined,
      }));
  }, [activeContracts, id, user]);

  if (loading) {
    return (
      <Centered>
        <div>Loading participant details...</div>
      </Centered>
    );
  }

  if (!user) {
    return (
      <Centered>
        <Card className="w-full">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">User not found.</CardContent>
        </Card>
      </Centered>
    );
  }

  return (
    <Centered>
      <div className="w-full max-w-6xl space-y-8">
        <div className="mb-6">
          <Link href="/fqa/participants" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to participants
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex w-full items-center justify-between gap-3">
                <CardTitle className="text-3xl">
                  <UserLink
                    id={user.id}
                    country={user.country}
                    username={user.username}
                    href={`https://minesweeper.online/player/${user.id}`}
                  />
                </CardTitle>
                <AvailableBadge available={user.available} />
              </div>
            </div>
            <CardDescription>{getType(user.access)}</CardDescription>
          </CardHeader>
        </Card>

        {user.access === "contractor" && activeStatus === "loaded" && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Active Contracts</h2>
            {userContracts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  No active contracts for this user.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {userContracts.map((card) => (
                  <ContractCard key={card.id} contract={card} href={`/fqa/contracts/${encodeURIComponent(card.id)}`} />
                ))}
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
      <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center px-8 bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
};
