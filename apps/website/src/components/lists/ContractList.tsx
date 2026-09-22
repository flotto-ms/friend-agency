import { useEffect, useState } from "react";
import ContractCard, { ContractCardProps } from "../ContractCard";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const ContractList: React.FC<{ cards: ContractCardProps["contract"][]; empty?: string }> = ({
  cards,
  empty = "No active contracts right now.",
}) => {
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [cards]);

  const pageSize = 12;

  const totalPages = Math.ceil(cards.length / pageSize);
  const paginatedCards = cards.slice(page * pageSize, (page + 1) * pageSize);

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">{empty}</CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {paginatedCards.map((card) => (
          <ContractCard key={card.id} contract={card} href={`/fqa/contracts/${encodeURIComponent(card.id)}`} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, cards.length)} of {cards.length} contracts
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractList;
