import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { LayoutGrid, List } from "lucide-react";
export type View = "card" | "table";
const ContractView: React.FC<{ view: View; onChange: (val: View) => void }> = ({ view, onChange }) => {
  return (
    <Tabs value={view} onValueChange={(v) => onChange(v as View)}>
      <TabsList>
        <TabsTrigger value="card" aria-label="Card View">
          <LayoutGrid className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="table" aria-label="Table View">
          <List className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export const useViewSelector = () => {
  const [view, setView] = useState<View>(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("contractListView");
      if (savedView === "table" || savedView === "card") {
        return savedView;
      }
    }
    return "card";
  });

  const handleViewChange = (v: string) => {
    const newView = v as "card" | "table";
    setView(newView);
    localStorage.setItem("contractListView", newView);
  };

  const component = <ContractView view={view} onChange={handleViewChange} />;

  return {
    view,
    component,
  };
};

export default ContractView;
