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
          <p className="mb-2">
            Contractors who let quests expire will incur a penalty of 10x the original quest value to compensate
            Suppliers. Most Contractors can complete their quests - if you're unsure about your capabilities, please
            reconsider your registration for this role. We don't want you to expire our quests!
          </p>
          <p className="mb-2">
            If a Contractor expires your quest, we encourage you to inform us as soon as possible so we can bring it up
            with them. You will receive 10x the original quest value as compensation for any expired quests.
          </p>
          <p className="mb-2">You will not be charged for quests you did not subscribe to.</p>
          <p className="mb-2">
            You agree to send quests to other Contractors. How much is up to you, but the more you send through our
            service, the more you benefit from it (and the better it is for our Contractors).
          </p>
          <p className="mb-2">
            If you wish to withdraw as a Contractor later down the line (after registering), please inform us.
          </p>
          <p className="mb-2">
            Earnings (e.g. sending quests, rewards, compensation, etc.) will be deposited to your Flotto Wallet. Your
            transaction history is also provided.
          </p>
          <p className="mb-2">
            Charges (e.g. receiving quests, expiration penalties) will be deducted from your Flotto Wallet. Your
            transaction history is also provided.
          </p>
          <p className="mb-2">
            Your Flotto Wallet balance (from above) will be consolidated into a single final exchange sent within 3 days
            after the event concludes. If it is negative, you agree to settle this outstanding balance in full within
            one week. You cannot withdraw from your Flotto Wallet until the end of the season.
          </p>
          <p className="mb-2">
            If a Contractor refuses to pay for your quests, we will cover 100% of your lost revenue within 10 days after
            the event ends. This is why we carefully select Contractors, taking on these risks to ensure your continued
            confidence in our agency.
          </p>
          <p className="mb-2">
            If Flippa is late, it means they're totally next to a black hole and that everything is actually on time!
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={acceptTerms} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Joining Season 8..." : "Agree and become a contractor"}
        </Button>
      </CardContent>
    </Card>
  );
};
