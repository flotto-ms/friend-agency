import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Extension | Flotto",
  description: "Flotto Browser Extension",
};

const Page: React.FC = () => {
  return (
    <div className=" mx-auto max-w-[900px] p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Flotto's Free Browser Extension</h1>
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[350px]">
          <h2 className="text-xl font-semibold mb-6">Chrome Web Store</h2>
          <p className="text-md">Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi and Yandex.</p>
          <a
            href="https://chromewebstore.google.com/detail/flotto-fqa/nabojgbfhndgebcckhfmfehmhppgbglf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 my-4 font-semibold text-white hover:bg-blue-700"
          >
            Install from Store
          </a>
          <p className="text-sm mb-6 text-gray-500">
            Some browsers like Microsoft Edge may require you to enable "Allow extensions from other stores" in
            settings.
          </p>
        </div>
        <div className="flex-1 min-w-[350px]">
          <h2 className="text-xl font-semibold mb-6">Firefox Add-On</h2>
          <p className="text-md">FireFox, LibreWolf, Waterfox, Floorp, Zen Browser, Pale Moon and K-Meleon.</p>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/flotto-fqa/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 my-4 font-semibold text-white hover:bg-blue-700"
          >
            Install from Store
          </a>
        </div>
      </div>

      <h2 className="text-2xl font-semibold my-4">Wallet Summary</h2>
      <p className="text-lg mb-6">The extension integrates your Flotto wallet summary into the event page.</p>
      <Image src="/WalletSummary.png" alt="Wallet Summary" className="mb-12" width={900} height={20} />

      <h2 className="text-2xl font-semibold my-4">Quest Search</h2>
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
