"use client";
import QuestSearchTable from "@/components/tables/QuestSearchTable";
import { QuestSearchItem } from "@/components/tables/QuestSearchTable/types";
import { Textarea } from "@/components/ui/textarea";

const data: QuestSearchItem[] = [
  {
    level: 30,
    elite: false,
    description: "Complete L5 Speed arena or higher",
    rate: 120,
  },
  {
    level: 26,
    elite: false,
    description: "Win 8 Evil NG level games without hints",
    rate: 240,
  },
  {
    level: 35,
    elite: false,
    description: "Complete 18 games in PvP mode",
    rate: 220,
  },
  {
    level: 35,
    elite: true,
    description: "Find 35 gems",
    rate: 250,
  },
  {
    level: 21,
    elite: false,
    description: "Complete L4 Speed arena or higher",
    rate: 120,
  },
  {
    level: 32,
    elite: false,
    description: "Earn 8 000 minecoins",
    rate: 200,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        <QuestSearchTable data={data} />
        <Textarea value="" onChange={() => {}} className="max-w-[400px]" placeholder="Paste your quests here." />
      </main>
    </div>
  );
}
