import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sending Quests | Flotto",
  description: "Information on how to send quests with Flotto",
};

const Page: React.FC = () => {
  return (
    <div className=" mx-auto max-w-[900px] p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Sending Quests</h1>
    </div>
  );
};
export default Page;
