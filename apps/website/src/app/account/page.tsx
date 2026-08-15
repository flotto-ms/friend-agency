import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "@/components/UserSearch";

export default function Account() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        <Card className="w-[350px] mx-auto">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Please sign in to view contractor details.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserSearch />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
