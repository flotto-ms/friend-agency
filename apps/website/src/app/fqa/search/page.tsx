"use client";
import QuestSearchTable from "@/components/tables/QuestSearchTable";
import { QuestSearchItem } from "@/components/tables/QuestSearchTable/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "@/components/UserSearch";
import { selectAuth } from "@/data/authSlice";
import api from "@/data/authSlice/api";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { initSearch, selectSearchQuests, selectSearchStatus } from "@/data/searchSlice";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const auth = useAppSelector(selectAuth);
  const searchStatus = useAppSelector(selectSearchStatus);
  const data = useAppSelector(selectSearchQuests);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (auth.status === "authorized" && searchStatus === "init") {
      dispatch(initSearch());
    }
  }, [auth.status, searchStatus]);

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
  }, [auth.status, searchStatus]);

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
