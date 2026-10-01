import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Extension | Flotto",
  description: "Flotto Browser Extension",
};

const Page: React.FC = () => {
  return (
    <div className=" mx-auto max-w-[900px] p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Flotto Browser Extension</h1>
      <h2 className="text-2xl font-semibold mb-6">Chrome Web Store</h2>
      <p className="text-lg mb-6">The free extension is available for all Chromium based browsers.</p>
      <div className="mb-8 flex flex-row gap-2 items-start">
        <a
          href="https://chromewebstore.google.com/detail/flotto-fqa/nabojgbfhndgebcckhfmfehmhppgbglf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Install the Extension
        </a>
      </div>
      <h2 className="text-2xl font-semibold mb-6">Quest Search</h2>
      <p className="text-lg mb-6">
        The extension seemlessly integrates the Flotto quest search into the event page. Providing the latest pricing
        data available for you.
      </p>
      <Image src="/QuestSearch.png" alt="Quest Search" className="mb-12" width={900} height={20} />
      <h2 className="text-2xl font-semibold mb-6">Quest Log</h2>
      <p className="text-lg mb-6">Integrates sale and purchase information into the quest log for easy reference.</p>
      <Image src="/QuestLog.png" alt="Quest Log" width={900} height={20} />
    </div>
  );
};
export default Page;
