import { cn } from "@/lib/utils";

const AvailableBadge: React.FC<{ available?: boolean; className?: string }> = ({ available = false, className }) => {
  return (
    <span
      className={cn(
        `inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${
          available
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            : "bg-muted text-muted-foreground"
        }`,
        className,
      )}
    >
      {available ? "Available" : "Busy"}
    </span>
  );
};

export default AvailableBadge;
