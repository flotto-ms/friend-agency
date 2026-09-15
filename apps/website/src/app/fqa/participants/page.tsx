"use client";

import ParticipantsTable from "@/components/tables/ParticipantsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "@/components/UserSearch";
import { selectAuth } from "@/data/authSlice";
import { loadContractorsAction, selectContractors, selectContractorsStatus } from "@/data/contractorsSlice";
import { loadSuppliersAction, selectSuppliers, selectSuppliersStatus } from "@/data/suppliersSlice";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { PropsWithChildren, useEffect, useMemo } from "react";

export default function Page() {
  const dispatch = useAppDispatch();

  const contractors = useAppSelector(selectContractors);
  const contractorsStatus = useAppSelector(selectContractorsStatus);

  const suppliers = useAppSelector(selectSuppliers);
  const suppliersStatus = useAppSelector(selectSuppliersStatus);

  useEffect(() => {
    if (contractorsStatus === "init") {
      dispatch(loadContractorsAction());
    }
    if (suppliersStatus === "init") {
      dispatch(loadSuppliersAction());
    }
  }, [contractorsStatus, suppliersStatus, dispatch]);

  const component = useMemo(() => {
    if (contractorsStatus !== "loaded" || suppliersStatus !== "loaded") {
      return (
        <Center>
          <div>Loading participants...</div>
        </Center>
      );
    }

    return (
      <div>
        <h1 className="text-3xl font-semibold text-center mb-6">Season 8</h1>
        <div className="flex flex-wrap gap-8 py-8 w-full max-w-[1200px] mx-auto">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Contractors</h2>
            <ParticipantsTable data={contractors} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Suppliers</h2>
            <ParticipantsTable data={suppliers} />
          </div>
        </div>
      </div>
    );
  }, [contractorsStatus, suppliersStatus, contractors, suppliers]);

  return <div className="min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black py-8 px-4">{component}</div>;
}

const Center: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex min-h-[50vh] w-full max-w-[1200px] flex-col items-center justify-center mx-auto">
      {children}
    </main>
  );
};

const SignIn: React.FC = () => {
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Please sign in to view the season participants.</CardDescription>
      </CardHeader>
      <CardContent>
        <UserSearch />
      </CardContent>
    </Card>
  );
};
