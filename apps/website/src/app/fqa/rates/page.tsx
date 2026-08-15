"use client";

import RateEditor from "@/components/RateEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { selectAuth } from "@/data/authSlice";
import { useAppSelector } from "@/data/hooks";
import { UserSearch } from "lucide-react";
import { PropsWithChildren, useMemo, useState } from "react";

export default function Page() {
  const auth = useAppSelector(selectAuth);

  const component = useMemo(() => {
    switch (auth.status) {
      case "loading":
        return (
          <Center>
            <div>Loading...</div>
          </Center>
        );
      case "authorized":
        return <RateEditor />;
      default:
        return (
          <Center>
            <SignIn />
          </Center>
        );
    }
  }, [auth.status]);

  return <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black py-8">{component}</div>;
}

const Center: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
      {children}
    </main>
  );
};

const SignIn: React.FC = () => {
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Please sign in to edit your rates.</CardDescription>
      </CardHeader>
      <CardContent>
        <UserSearch />
      </CardContent>
    </Card>
  );
};
