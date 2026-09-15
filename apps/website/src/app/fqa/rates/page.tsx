"use client";

import RateEditor from "@/components/RateEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "@/components/UserSearch";
import { becomeContractor, selectAuth } from "@/data/authSlice";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
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
        return auth.access === "contractor" ? <RateEditor /> : <BecomeContractor />;
      default:
        return (
          <Center>
            <SignIn />
          </Center>
        );
    }
  }, [auth.access, auth.status]);

  return <div className=" min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black py-8">{component}</div>;
}

const Center: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between px-16 bg-white dark:bg-black">
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

const BecomeContractor: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptTerms = async () => {
    setIsSubmitting(true);
    await dispatch(becomeContractor());
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-[520px] mx-auto">
      <CardHeader>
        <CardTitle>Become a Contractor</CardTitle>
        <CardDescription>
          Agree to the contractor terms and conditions to participate in Season 8 and manage your rates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={acceptTerms} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Joining Season 8..." : "Accept terms and become a contractor"}
        </Button>
      </CardContent>
    </Card>
  );
};
