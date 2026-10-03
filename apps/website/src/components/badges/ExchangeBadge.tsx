import { cn } from "@/lib/utils";

const ExchangeBadge: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <span
      className={cn(
        `inline-flex mr-2 items-center rounded-full px-2 py-1 text-[10px] font-medium bg-orange-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300`,
        className,
      )}
    >
      Exchange Only
    </span>
  );
};

export default ExchangeBadge;
