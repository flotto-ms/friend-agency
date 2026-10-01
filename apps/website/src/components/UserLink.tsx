import { ClipboardPen, CopyCheckIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
type Props = {
  id?: number;
  country?: string;
  username: string;
  copyId?: boolean;
  openExchange?: boolean;
  href?: string;
};
const UserLink: React.FC<Props> = ({ id, country = "xx", username, href, copyId = false, openExchange = false }) => {
  const router = useRouter();
  return (
    <div className="flex felx-col gap-2 items-center justify-start truncate text-ellipsis">
      <img src={`https://minesweeper.online/img/flags/${country.toLowerCase()}.png`} alt={`${country} flag`} />
      {href ? (
        <button
          className="hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (href.startsWith("/")) {
              router.push(href);
            } else {
              window.open(href, "_blank");
            }
          }}
        >
          {username}
        </button>
      ) : (
        <span>{username}</span>
      )}
      {id && (
        <>
          {openExchange ? <ExchangeButton id={id} /> : copyId ? <CopyButton id={id} username={username} /> : undefined}
        </>
      )}
    </div>
  );
};

const CopyButton: React.FC<{ id: number; username: string }> = ({ id, username }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(id.toString()).then(() => {
          toast.info(
            `${username}'s ID copied to clipboard, paste this into user search when sending the quest or creating an exchange.`,
          );
        });
      }}
    >
      <ClipboardPen />
    </Button>
  );
};

const ExchangeButton: React.FC<{ id: number }> = ({ id }) => {
  return (
    <a
      href={`https://minesweeper.online/exchange/new/${id}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
      target="_blank"
    >
      <Button variant="ghost" size="icon">
        <ExternalLink />
      </Button>
    </a>
  );
};

export default UserLink;
