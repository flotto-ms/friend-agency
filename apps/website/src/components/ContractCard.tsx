import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFilterDescription } from "@/lib/FilterDesc";
import { getQuestDescription } from "@/components/QuestTypeSelect";
import UserLink from "./UserLink";
import AvailableBadge from "./badges/AvailableBadge";

const formatDate = (value?: string) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

type ContractCardProps = {
  contract: {
    id: string;
    userId: number;
    type: number;
    price: number;
    startedAt: string;
    preferExchange?: boolean;
    filter?: Record<string, unknown>;
    contractor?: {
      id?: number;
      country?: string;
      username?: string;
      available?: boolean;
    };
  };
  href: string;
};

export default function ContractCard({ contract, href }: ContractCardProps) {
  const questDescription = getQuestDescription(String(contract.type));
  const filterDescription = contract.filter ? getFilterDescription(contract as any) : null;

  return (
    <Link href={href} className="block">
      <Card className="h-full transition hover:border-primary/60 hover:shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <UserLink
              id={contract.userId}
              country={contract.contractor?.country}
              username={contract.contractor?.username ?? `User ${contract.userId}`}
              copyId
              openExchange={contract.preferExchange}
            />
            <AvailableBadge available={contract.contractor?.available} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Quest</span>
            <span className="font-medium text-right">
              {questDescription}
              {filterDescription && <span className="text-muted-foreground"> · {filterDescription}</span>}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Started</span>
            <span className="font-medium text-right">{formatDate(contract.startedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">
              {contract.preferExchange && (
                <span
                  className={`inline-flex mr-2 items-center rounded-full px-2 py-1 text-[10px] font-medium bg-emerald-100 text-yellow-500 dark:bg-yellow-950 dark:text-yellow-200`}
                >
                  Exchange Only
                </span>
              )}
              {contract.price}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
