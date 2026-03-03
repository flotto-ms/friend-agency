import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discord Server",
  description: "Join us on Discord",
};

const Page: React.FC = () => {
  return (
    <div className=" mx-auto max-w-[500px] p-6">
      <Card>
        <CardHeader>
          <CardTitle>Join Our Discord Community!</CardTitle>
          <CardDescription>
            Connect with like-minded individuals and engage in exciting
            discussions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-center mb-4">
            <img
              src="/icon.png"
              alt="Flotto Discord Server"
              className="w-20 h-20 rounded-full border-2 border-accent-foreground"
            />
          </div>

          <div className="text-center">
            <p className="font-semibold mb-4">Why join?</p>
            <ul className="list-disc list-inside space-y-2 text-left text-sm">
              <li>Get updates on the latest news</li>
              <li>Participate in exclusive events</li>
              <li>Meet new friends and community members</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href="https://discord.gg/fXYe9wC3Ps"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Now
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
export default Page;
