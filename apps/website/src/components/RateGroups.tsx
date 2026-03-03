import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { createGroup, selectRates } from "@/data/rateSlice";
import { useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  CircleMinus,
  CirclePlus,
  MoreHorizontalIcon,
  Plus,
  Trash2Icon,
} from "lucide-react";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { RateItem } from "./tables/RateTable/types";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { ButtonGroup } from "./ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type RateGroupProps = {
  selectedGroupId?: string;
  selectedRateIds?: string[];
  onGroupChange: (id: string) => void;
  onGroupEnable: (enabled: boolean) => void;
  onGroupDelete: () => void;
};

const RateGroups: React.FC<RateGroupProps> = ({
  selectedGroupId = "all",
  selectedRateIds = [],
  onGroupChange,
  onGroupEnable,
  onGroupDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groupName, setGroupName] = useState("");

  const dispatch = useAppDispatch();
  const slice = useAppSelector(selectRates);
  const loaded = slice.status === "loaded";

  const { groups, allEnabled } = useMemo(() => {
    if (slice.status !== "loaded") {
      return {
        groups: [],
        rates: Array(6)
          .fill(1)
          .map((_, i) => ({ id: `tmp_${i}` }) as RateItem),
        allEnabled: false,
      };
    }

    const countGroups = (id: string) => {
      return Object.values(slice.rates).filter((r) =>
        Boolean(r.groups?.includes(id)),
      ).length;
    };

    const data = {
      groups: Object.entries(slice.groups)
        .map(([id, data]) => ({
          id,
          ...data,
          rates: countGroups(id),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      rates: Object.entries(slice.rates)
        .filter(
          ([_, r]) =>
            selectedGroupId === "all" ||
            Boolean(r.groups?.includes(selectedGroupId)),
        )
        .map(([id, data]) => ({ id, ...data }) as RateItem)
        .sort((a, b) => a.description.localeCompare(b.description)),
      allEnabled: false,
    };

    data.allEnabled =
      data.rates.filter((r) => r.enabled).length === data.rates.length;

    return data;
  }, [slice, selectedGroupId]);

  const onCreateClick = () => {
    setSaving(true);

    dispatch(createGroup({ label: groupName, rates: selectedRateIds }))
      .then((e) => {
        setOpen(false);
        onGroupChange((e.payload as any).id as string);
        setGroupName("");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="flex flex-row justify-between items-center mb-6">
      <Tabs value={selectedGroupId} onValueChange={onGroupChange}>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex ">
          <TabsTrigger value="all">All</TabsTrigger>
          {loaded ? (
            <>
              {groups.map((group) => (
                <TabsTrigger key={group.id} value={group.id}>
                  {group.label}
                  <Badge variant="secondary">{group.rates}</Badge>
                </TabsTrigger>
              ))}

              {groups.length < 5 && (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger className="mr-2">
                    <Plus />
                  </PopoverTrigger>

                  <PopoverContent>
                    <Field>
                      <FieldLabel htmlFor="stack-group">
                        Create Stack Group
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          disabled={saving}
                          value={groupName}
                          onChange={(e) => setGroupName(e.currentTarget.value)}
                          maxLength={20}
                          autoFocus
                          id="stack-group"
                          placeholder="Group Name"
                        />
                      </FieldContent>
                    </Field>

                    {selectedRateIds.length > 0 && (
                      <p className="text-sm my-4">
                        The {selectedRateIds.length} selected Rates will be
                        added to the group
                      </p>
                    )}

                    <Button
                      disabled={saving}
                      onClick={onCreateClick}
                      className="mt-2"
                    >
                      {saving && <Spinner />}
                      Create
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
            </>
          ) : (
            <Spinner className="mx-4" />
          )}
        </TabsList>
      </Tabs>

      <ButtonGroup>
        <Button
          variant="outline"
          disabled={!loaded}
          onClick={() => onGroupEnable(!allEnabled)}
        >
          {allEnabled ? <CircleMinus /> : <CirclePlus />}
          {allEnabled ? "Disable" : "Enable"}{" "}
          {selectedGroupId == "all" ? "All" : "Group"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={!loaded}
              aria-label="More Options"
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onGroupEnable(true)}>
                <CirclePlus />
                Enable All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupEnable(false)}>
                <CircleMinus />
                Disbale All
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={selectedGroupId === "all"}
                onClick={onGroupDelete}
                variant="destructive"
              >
                <Trash2Icon />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
};

export default RateGroups;
