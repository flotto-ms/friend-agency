import Image from "next/image";

const Page: React.FC = () => {
  return (
    <div className=" mx-auto max-w-[900px] p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Flotto Browser Extension
      </h1>
      <h2 className="text-2xl font-semibold mb-6">Quest Search</h2>
      <p className="text-lg mb-6">
        The extension seemlessly integrates the Flotto quest search into the
        event page. Providing the latest pricing data available for you.
      </p>
      <Image
        src="/QuestSearch.png"
        alt="Quest Search"
        className="mb-12"
        width={900}
        height={20}
      />
      <h2 className="text-2xl font-semibold mb-6">Quest Log</h2>
      <p className="text-lg mb-6">
        Integrates sale and purchase information into the quest log for easy
        reference.
      </p>
      <Image src="/QuestLog.png" alt="Quest Log" width={900} height={20} />
    </div>
  );
};
export default Page;
