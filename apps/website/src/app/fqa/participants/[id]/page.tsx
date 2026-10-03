"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import {
  loadActiveContractsAction,
  selectActiveContracts,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import AvailableBadge from "@/components/badges/AvailableBadge";
import UserLink from "@/components/UserLink";
import { getType, selectAuth } from "@/data/authSlice";
import ContractList from "@/components/lists/ContractList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewSelector } from "@/components/tabs/ContractView";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UserSummary = {
  id: number;
  username: string;
  country: string;
  available?: boolean;
  access?: string;
  ratesLocked?: boolean;
  slots?: number;
  isFull?: boolean;
  allowFriendQuests?: boolean;
};

export default function ParticipantPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);

  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const onCancelConfirm = () => {
    Promise.all(
      userContracts.map((c) => {
        api.contract.end(c.id);
      }),
    ).catch((ex) => {
      console.error(ex);
    });
  };

  const handleAvailabilityChange = (value: string) => {
    const isAvailable = value === "available";
    // Optimistically update the UI to feel responsive
    setUser((prev) => (prev ? { ...prev, available: isAvailable } : null));

    api.user
      .update({ available: isAvailable }, String(id))
      .then((updatedUser) => {
        setUser((prev) => (prev ? { ...prev, available: updatedUser.available } : null));
      })
      .catch((err) => {
        console.error("Failed to update user availability", err);
        // Revert on error
        setUser((prev) => (prev ? { ...prev, available: !isAvailable } : null));
      });
  };

  const handleRateLockChange = (value: string) => {
    const ratesLocked = value === "locked";
    // Optimistically update the UI to feel responsive
    setUser((prev) => (prev ? { ...prev, ratesLocked } : null));

    api.user
      .update({ ratesLocked }, String(id))
      .then((updatedUser) => {
        setUser((prev) => (prev ? { ...prev, available: updatedUser.ratesLocked } : null));
      })
      .catch((err) => {
        console.error("Failed to update user availability", err);
        // Revert on error
        setUser((prev) => (prev ? { ...prev, ratesLocked: !ratesLocked } : null));
      });
  };

  const handleAccessChange = useCallback(
    (value: string) => {
      if (!user) return;
      setUser((prev) => (prev ? { ...prev, access: value } : null));
      api.admin.setUserAccess(user.id.toString(), value as any).catch((e) => console.error(e));
    },
    [user],
  );

  const { view, component: viewSelector } = useViewSelector();

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
      <div className="w-full max-w-300 space-y-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to participants
          </button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex w-full items-center justify-between gap-3">
                <CardTitle className="text-3xl">
                  <UserLink
                    id={user.id}
                    country={user.country}
                    username={user.username ?? `Anonymous${user.id}`}
                    href={`https://minesweeper.online/player/${user.id}`}
                  />
                </CardTitle>

                {user.access === "contractor" &&
                  (auth.isAdmin ? (
                    <Tabs value={user.available ? "available" : "busy"} onValueChange={handleAvailabilityChange}>
                      <TabsList>
                        <TabsTrigger value="available">Available</TabsTrigger>
                        <TabsTrigger value="busy">Busy</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  ) : (
                    <AvailableBadge available={user.available} />
                  ))}
              </div>
            </div>
            <CardDescription>
              {getType(user.access ?? "member")}
              {user.access === "contractor" && !user.allowFriendQuests && (
                <p className="py-4">Not accepting "Sent Quests" at this time, please use exchange.</p>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {auth.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Administration</CardTitle>
              <CardDescription>
                <table>
                  <tbody>
                    <tr>
                      <td className="py-2 pr-4">Season Access:</td>
                      <td className="py-2">
                        <Tabs value={user.access ?? "member"} onValueChange={handleAccessChange}>
                          <TabsList>
                            <TabsTrigger value="member">Member</TabsTrigger>
                            <TabsTrigger value="supplier">Supplier</TabsTrigger>
                            <TabsTrigger value="contractor">Contractor</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Rates Locked:</td>
                      <td className="py-2">
                        <Tabs value={user.ratesLocked ? "locked" : "unlocked"} onValueChange={handleRateLockChange}>
                          <TabsList>
                            <TabsTrigger value="locked">Locked</TabsTrigger>
                            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {user.access === "contractor" && activeStatus === "loaded" && (
          <div>
            <div className="flex flex-row gap-2">
              <h2 className="text-2xl flex-1 font-semibold tracking-tight mb-4">Current Offers</h2>
              {userContracts.length > 0 && auth.isAdmin && (
                <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
                  End All Offers
                </Button>
              )}
              {viewSelector}
            </div>
            <ContractList
              view={view}
              cards={userContracts}
              empty="No offers are currently available for this contractor."
            />
          </div>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={() => setConfirmDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End All Offers?</AlertDialogTitle>
            <AlertDialogDescription>This will end all of {user.username}'s current offers?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onCancelConfirm}>
              End Offers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Centered>
  );
}

const Centered: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center py-12 px-8 bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
};
