import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get Started | Flotto",
  description: "Information on how to get sterted with Flotto",
};

const Page: React.FC = () => {
  return (
    <div className=" mx-auto max-w-[900px] p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Get Started</h1>
      <h2 className="text-2xl font-semibold my-4">Sign In</h2>
      <ul className="text-md mb-6 list-disc list-outside ml-4">
        <li className="my-2">
          If you are not already signed in, you can do so by visiting the{" "}
          <Link className="hover:underline text-blue-300" href="/fqa/search">
            Quest Search
          </Link>{" "}
          page.
        </li>
        <li className="my-2">
          Type in your minesweeper.online username, and select the matching user from the search result.
        </li>
        <li className="my-2">
          Flotto Bot will send you a private message on minesweeper.online with your temporary password.
        </li>
        <li className="my-2">Enter the password to complete the sign in process.</li>
      </ul>

      <h2 className="text-2xl font-semibold my-4">Participate in the Season</h2>
      <p className="text-md mb-4">
        Read the agreement, and if you are happy to proceed click the button to participate in the season as a supplier.
      </p>
      <p className="text-md mb-6">
        Being a supplier simply means you can send quests to contractors without a minecoin value attached (either by{" "}
        <Link className="hover:underline text-blue-300" href="/docs/send-quests">
          sending the quest
        </Link>{" "}
        , or{" "}
        <Link className="hover:underline text-blue-300" href="/docs/send-exchanges">
          sending an exchange
        </Link>
        ). Flotto will log the quest with the offer, and add the value to your{" "}
        <Link className="hover:underline text-blue-300" href="/fqa/wallet">
          wallet
        </Link>
        . At the end of the season you will receive a single exchange with the balance of your wallet.
      </p>
      <h2 className="text-2xl font-semibold mb-6">Finding Contractors</h2>
      <ul className="text-md mb-6 list-disc list-outside ml-4">
        <li className="my-2">
          If you are participating as a supplier, the site will load your daily friend quests, and attempt to match the
          quest the the best available contractor.
        </li>
        <li className="my-2">Some quests are marked "Exchange Only" as contractors may prefer those.</li>
        <li className="my-2">
          Use the hide exchange-only option to filter out offers that are only available through an exchange.
        </li>
        <li className="my-2">
          The best march will automatically update when contractor availability changes, or offers change.
        </li>
      </ul>

      <Image src="/QuestSearchResult.png" alt="Quest Search Result" width={900} height={20} />
      <p className="text-md mb-6"></p>
    </div>
  );
};
export default Page;
