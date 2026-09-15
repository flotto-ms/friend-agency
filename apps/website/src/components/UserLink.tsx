import { CopyCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
type Props = {
  id?: number;
  country?: string;
  username: string;
  copyId?: boolean;
};
const UserLink: React.FC<Props> = ({ id, country = "xx", username, copyId = false }) => {
  return (
    <div className="flex felx-col gap-2 items-center justify-start truncate text-ellipsis">
      <img src={`https://minesweeper.online/img/flags/${country.toLowerCase()}.png`} alt={`${country} flag`} />
      <span>{username}</span>
      {copyId && id && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            navigator.clipboard.writeText(id.toString()).then(() => {
              toast.info("User's ID coppied to clipboard, paste this into user search when sending the quest.");
            });
          }}
        >
          <CopyCheckIcon />
        </Button>
      )}
    </div>
  );
};

export default UserLink;
