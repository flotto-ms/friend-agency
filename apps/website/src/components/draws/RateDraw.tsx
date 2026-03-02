"use client";
import { PropsWithChildren, useMemo, useState } from "react";
import MinMaxSlider from "../MinMaxSlider";
import PriceSlider from "../PriceSlider";
import QuestTypeSelect, { getQuestDescription } from "../QuestTypeSelect";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "../ui/field";
import { Switch } from "../ui/switch";
import { RateItem } from "../tables/RateTable/types";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { resetStopped, selectRates, updateRate } from "@/data/rateSlice";
import { Spinner } from "../ui/spinner";
import { Checkbox } from "../ui/checkbox";
import { Card } from "../ui/card";

export type RateDrawProps = {
  rate?: RateItem;
  selectedGroup?: string;
} & PropsWithChildren;

const RateDraw: React.FC<RateDrawProps> = ({
  rate,
  selectedGroup,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  return (
    <Drawer open={open} onClose={onClose} direction="right" handleOnly>
      <DrawerTrigger onClick={() => setOpen(true)} asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
        <Contents rate={rate} selectedGroup={selectedGroup} onClose={onClose} />
      </DrawerContent>
    </Drawer>
  );
};

const Contents: React.FC<RateDrawProps & { onClose: () => void }> = ({
  rate,
  selectedGroup,
  onClose,
}) => {
  const slice = useAppSelector(selectRates);

  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(rate?.type ?? 0);
  const [amount, setAmount] = useState(rate?.rate ?? 150);
  const [enabled, setEnabled] = useState(rate?.enabled ?? false);
  const [groups, setGroups] = useState(
    rate?.groups ?? (selectedGroup ? [selectedGroup] : []),
  );

  const dispatch = useAppDispatch();

  const onClick = () => {
    setSaving(true);

    const newRate: RateItem = rate
      ? { ...structuredClone(rate), rate: amount, enabled, groups }
      : {
          id: crypto.randomUUID(),
          type,
          stopping: false,
          enabled,
          description: getQuestDescription(type.toString()),
          rate: amount,
          groups,
        };

    if (rate && rate.enabled && !newRate.enabled) {
      newRate.stopping = true;
    }

    dispatch(updateRate(newRate)).then(() => {
      if (rate && rate.enabled && !newRate.enabled) {
        dispatch(resetStopped(newRate.id));
      }
      onClose();
    });
  };

  const toggleGroup = (id: string) => {
    setGroups((old) => {
      if (old.includes(id)) {
        return old.filter((v) => v !== id);
      }
      return [...old, id];
    });
  };

  const toggles = useMemo(() => {
    return Object.entries(slice.groups)
      .sort((a, b) => a[1].label.localeCompare(b[1].label))
      .map(([id, item]) => ({ id, ...item }));
  }, [slice.groups]);

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Quest Rate</DrawerTitle>
        <DrawerDescription>
          Set the rate you are willing to pay for a quest.
        </DrawerDescription>
      </DrawerHeader>
      <div className="no-scrollbar overflow-y-auto px-4 flex flex-col gap-4">
        <QuestTypeSelect
          value={type}
          onChange={setType}
          disabled={Boolean(rate)}
        />

        {type > 0 && (
          <>
            <PriceSlider value={amount} onChange={setAmount} />
            <FieldLabel htmlFor="switch-focus-mode">
              <Field orientation="horizontal" className="max-w-sm">
                <FieldContent>
                  <FieldTitle>Active</FieldTitle>
                  <FieldDescription>
                    You will receive quests when your status is set to open, and
                    you have free slots
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="switch-focus-mode"
                  checked={enabled}
                  disabled={rate?.stopping ?? false}
                  onClick={() => setEnabled(!enabled)}
                />
              </Field>
            </FieldLabel>

            <Accordion
              type="single"
              collapsible
              className="max-w-lg rounded-lg border"
            >
              <AccordionItem
                value="value"
                className="border-b px-4 last:border-b-0"
              >
                <AccordionTrigger>Advanced Filter</AccordionTrigger>
                <AccordionContent>
                  <MinMaxSlider />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Card className="bg-transparent p-4">
              <FieldSet>
                <FieldLegend variant="label">Stack Groups</FieldLegend>
                <FieldGroup>
                  <div className="flex flex-wrap gap-2">
                    {toggles.map((t) => (
                      <Field key={t.id} orientation="horizontal">
                        <Checkbox
                          id={t.id}
                          checked={groups.includes(t.id)}
                          onClick={() => toggleGroup(t.id)}
                        />
                        <FieldLabel htmlFor={t.id}>{t.label}</FieldLabel>
                      </Field>
                    ))}
                  </div>
                </FieldGroup>
              </FieldSet>
            </Card>
          </>
        )}
      </div>
      <DrawerFooter>
        <Button disabled={saving} onClick={onClick}>
          {saving && <Spinner />}
          {rate ? "Save Changes" : "Create Rate"}
        </Button>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
};
export default RateDraw;
