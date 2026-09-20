"use client";
import QuestSearchTable from "@/components/tables/QuestSearchTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserSearch } from "@/components/UserSearch";
import {
  loadActiveContractsAction,
  selectActiveContracts,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import { becomeSupplier, selectAuth } from "@/data/authSlice";
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
  const [hideExchangeOnly, setHideExchangeOnly] = useState(false);

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
    const availableContractors = contractors.filter((c) => c.id !== auth.userId && c.available);
    const availableContracts = contracts.filter(
      (c) =>
        (!hideExchangeOnly && c.preferExchange && c.userId !== auth.userId) ||
        (!c.preferExchange && availableContractors.some((con) => con.id == c.userId)),
    );

    return quests.map((q) => {
      const { country, username, rate, ...quest } = q;
      const contract = getBestMatchingContract(q, availableContracts);
      if (contract) {
        const contractor = contractors.find((c) => c.id === contract.userId);
        return {
          ...quest,
          rate: contract.price,
          preferExchange: contract.preferExchange,
          username: contractor?.username,
          country: contractor?.country ?? "xx",
        };
      }
      return quest;
    });
  }, [quests, contractors, contracts, hideExchangeOnly]);

  const component = useMemo(() => {
    switch (auth.status) {
      case "loading":
        return <div>Loading...</div>;
      case "authorized":
        if (auth.access !== "supplier" && auth.access !== "contractor") {
          return <BecomeSupplier />;
        } else if (searchStatus !== "loaded") {
          return <div>Loading...</div>;
        } else {
          return (
            <QuestSearchTable
              hideExchangeOnly={hideExchangeOnly}
              onChangeHideExchangeOnly={setHideExchangeOnly}
              data={data}
            />
          );
        }
      default:
        return <SignIn />;
    }
  }, [auth.access, auth.status, searchStatus, data]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans py-8 dark:bg-black">
      <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between px-16 bg-white dark:bg-black">
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

const BecomeSupplier: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptTerms = async () => {
    setIsSubmitting(true);
    await dispatch(becomeSupplier());
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-[520px]">
      <CardHeader>
        <CardTitle>Participate in Season 8</CardTitle>
        <CardDescription>
          <p className="mb-2">
            If a Contractor expires your quest, we encourage you to inform us as soon as possible so we can bring it up
            with them. You will receive 10x the original quest value as compensation for any expired quests.
          </p>
          <p className="mb-2">
            You agree to send quests to other Contractors. How many is up to you, but the more you send through our
            service, the more you benefit from it (and the better it is for our Contractors). Earnings (e.g. sending
            quests, rewards, compensation, etc.) will be deposited to your Flotto Wallet.
          </p>
          <p className="mb-2">
            Your Flotto Wallet balance (from above) will be consolidated into a single final exchange sent within 3 days
            after the event concludes. If it is negative, you agree to settle this outstanding balance in full within
            one week.
          </p>
          <p className="mb-2">
            You cannot withdraw from your Flotto Wallet until the end of the season. If a Contractor refuses to pay for
            your quests, we will cover 100% of your lost revenue within 10 days after the event ends. This is why we
            carefully select Contractors, taking on these risks to ensure your continued confidence in our agency.
          </p>
          <p className="mb-2">
            If Flippa is late, it means they're totally next to a black hole and that everything is actually on time!
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={acceptTerms} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Joining Season 8..." : "Agree and participate in Season 8"}
        </Button>
      </CardContent>
    </Card>
  );
};
