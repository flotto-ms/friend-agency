"use client";
import QuestSearchTable from "@/components/tables/QuestSearchTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "@/components/UserSearch";
import {
  loadActiveContractsAction,
  selectActiveContracts,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import { selectAuth } from "@/data/authSlice";
import { loadContractorsAction, selectContractors, selectContractorsStatus } from "@/data/contractorsSlice";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { initSearch, selectSearchQuests, selectSearchStatus } from "@/data/searchSlice";
import { getBestMatchingContract } from "@/lib/ContractFilter";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const auth = useAppSelector(selectAuth);
  const searchStatus = useAppSelector(selectSearchStatus);
  const quests = useAppSelector(selectSearchQuests);
  const contracts = useAppSelector(selectActiveContracts);
  const contractors = useAppSelector(selectContractors);
  const contractStatus = useAppSelector(selectActiveContractsStatus);
  const contractorStatus = useAppSelector(selectContractorsStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (auth.status !== "authorized") {
      return;
    }
    if (searchStatus === "init") {
      dispatch(initSearch());
    }
    if (contractorStatus === "init") {
      dispatch(loadContractorsAction());
    }
    if (contractStatus === "init") {
      dispatch(loadActiveContractsAction());
    }
  }, [auth.status, searchStatus, contractorStatus, contractStatus, dispatch]);

  const data = useMemo(() => {
    return quests.map((q) => {
      const { country, username, rate, ...quest } = q;
      const contract = getBestMatchingContract(q, contracts);
      if (contract) {
        const contractor = contractors.find((c) => c.id === contract.userId);
        return { ...quest, rate: contract.price, username: contractor?.username, country: contractor?.country ?? "xx" };
      }
      return quest;
    });
  }, [quests, contractors, contracts]);

  const component = useMemo(() => {
    switch (auth.status) {
      case "loading":
        return <div>Loading...</div>;
      case "authorized":
        if (searchStatus !== "loaded") {
          return <div>Loading...</div>;
        } else {
          return <QuestSearchTable data={data} />;
        }
      default:
        return <SignIn />;
    }
  }, [auth.status, searchStatus, data]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        {component}
      </main>
    </div>
  );
}

const SignIn: React.FC = () => {
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Please sign in to search for contractors.</CardDescription>
      </CardHeader>
      <CardContent>
        <UserSearch />
      </CardContent>
    </Card>
  );
};
