import MinMaxSlider from "@/components/MinMaxSlider";
import PriceSlider from "@/components/PriceSlider";
import QuestTypeSelect from "@/components/QuestTypeSelect";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex gap-8 min-h-screen min-w-[600px] w-full flex-col max-w-[400px] py-32 px-16 bg-white dark:bg-black sm:items-start">
        <QuestTypeSelect />
        <PriceSlider />
        <MinMaxSlider />
        <Button variant="default">Create Rate</Button>
      </main>
    </div>
  );
}
