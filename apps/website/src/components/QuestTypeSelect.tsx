import { Fragment } from "react/jsx-runtime";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Field, FieldLabel } from "./ui/field";

const passives = [
  { label: "Experience", value: "8" },
  { label: "Mine Coins", value: "9" },
  { label: "Gems", value: "7" },
  { label: "Arena Coin", value: "1" },
];
const wins = [
  { label: "Beginner Wins", value: "19" },
  { label: "Intermediate Wins", value: "20" },
  { label: "Expert Wins", value: "21" },
  { label: "Medium NG Wins", value: "22" },
  { label: "Hard NG Wins", value: "23" },
  { label: "Evil NG Wins", value: "24" },
  { label: "Custom", value: "3" },
];
const winStreak = [
  { label: "Beginner Win Streak", value: "16" },
  { label: "Intermediate Win Streak", value: "17" },
  { label: "Expert Win Streak", value: "18" },
];
const noFlag = [
  { label: "Beginner No Flag", value: "10" },
  { label: "Intermediate No Flag", value: "11" },
  { label: "Expert No Flag", value: "12" },
  { label: "Hard NG No Flag", value: "13" },
  { label: "Evil NG No Flag", value: "14" },
];
const efficiency = [
  { label: "Beginner Eff", value: "4" },
  { label: "Intermediate Eff", value: "5" },
  { label: "Expert Eff", value: "6" },
];
const arena = [
  { label: "Speed", value: "25" },
  { label: "Speed NG", value: "26" },
  { label: "No Flags", value: "27" },
  { label: "Efficiency", value: "28" },
  { label: "High Difficulty", value: "29" },
  { label: "Random Difficulty", value: "30" },
  { label: "Hardcore", value: "31" },
  { label: "Hardcore NG", value: "32" },
];
const gems = [
  { label: "Ruby", value: "33" },
  { label: "Sapphire", value: "34" },
  { label: "Topaz", value: "35" },
  { label: "Onyx", value: "36" },
  { label: "Aquamarine", value: "37" },
  { label: "Emerald", value: "38" },
  { label: "Jade", value: "39" },
];

const multiplayer = [{ label: "PvP", value: "15" }];

const groups = [
  { label: "Passives", items: passives },
  { label: "Wins", items: wins },
  { label: "Win Streak", items: winStreak },
  { label: "Efficiency", items: efficiency },
  { label: "No Flag", items: noFlag },
  { label: "Multiplayer", items: multiplayer },
  { label: "Gems", items: gems },
  { label: "Arena", items: arena },
];

const QuestTypeSelect: React.FC = () => {
  return (
    <Field className="w-full">
      <FieldLabel>Quest Type</FieldLabel>
      <Select>
        <SelectTrigger className="w-full  max-w-[300px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {groups.map((g, i) => (
            <Fragment key={g.label}>
              {i > 0 && <SelectSeparator />}
              <SelectGroup>
                <SelectLabel>{g.label}</SelectLabel>
                {g.items.map((item) => (
                  <SelectItem key={item.value} value={`${item.value}`}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </Fragment>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
};

export default QuestTypeSelect;
