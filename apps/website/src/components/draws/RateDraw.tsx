"use client";
import { PropsWithChildren, ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import MinMaxSlider from "../MinMaxSlider";
import PriceSlider from "../PriceSlider";
import QuestTypeSelect, { getQuestDescription } from "../QuestTypeSelect";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
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

import rateConfig from "../../../public/rateconfig.json";
import { getFilterDescription, RateFilter, RateFilterRange } from "@/lib/FilterDesc";

export type RateDrawProps = {
  rate?: RateItem;
  selectedGroup?: string;
} & PropsWithChildren;

const RateDraw: React.FC<RateDrawProps> = ({ rate, selectedGroup, children }) => {
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

const Contents: React.FC<RateDrawProps & { onClose: () => void }> = ({ rate, selectedGroup, onClose }) => {
  const slice = useAppSelector(selectRates);

  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(rate?.type ?? 0);
  const [amount, setAmount] = useState(rate?.rate ?? 150);
  const [enabled, setEnabled] = useState(rate?.enabled ?? false);
  const [groups, setGroups] = useState(rate?.groups ?? (selectedGroup ? [selectedGroup] : []));
  const [filters, setFilters] = useState<RateFilter>(rate?.filters ?? {});

  useEffect(() => {}, [filters]);

  useEffect(() => setFilters({}), [type]);

  const dispatch = useAppDispatch();

  const onClick = () => {
    setSaving(true);

    const newRate: RateItem = rate
      ? {
          ...structuredClone(rate),
          rate: amount,
          enabled,
          groups,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          filter: getFilterDescription({ filter: filters }),
        }
      : {
          id: crypto.randomUUID(),
          type,
          stopping: false,
          enabled,
          description: getQuestDescription(type.toString()),
          filter: getFilterDescription({ filter: filters }),
          filters: Object.keys(filters).length > 0 ? filters : undefined,
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

  const setFilter = useCallback((key: keyof RateFilter, filter?: RateFilterRange) => {
    setFilters((old) => {
      const data = { ...old };
      if (!filter) {
        delete data[key];
      } else if (key !== "elite") {
        data[key] = filter;
      }
      return data;
    });
  }, []);

  const toggles = useMemo(() => {
    return Object.entries(slice.groups)
      .sort((a, b) => a[1].label.localeCompare(b[1].label))
      .map(([id, item]) => ({ id, ...item }));
  }, [slice.groups]);

  const sliders = useMemo(() => {
    if (!type) {
      return [];
    }

    const components: ReactElement[] = [];
    const config = rateConfig[`${type}` as keyof typeof rateConfig] as RateFilter;
    if (config.required) {
      components.push(
        <MinMaxSlider
          key={`${type}_amount`}
          label="Quantity"
          min={config.required.min}
          max={config.required.max}
          step={config.required.step}
          initialValue={filters?.required ? [filters.required.min, filters.required.max] : undefined}
          onChange={(range) => setFilter("required", range)}
        />,
      );
    }
    if (config.arenaLevel) {
      components.push(
        <MinMaxSlider
          key={`${type}_arena`}
          label="Arena Level"
          min={config.arenaLevel.min}
          max={config.arenaLevel.max}
          initialValue={filters?.arenaLevel ? [filters.arenaLevel.min, filters.arenaLevel.max] : undefined}
          onChange={(range) => setFilter("arenaLevel", range)}
        />,
      );
    }
    if (config.efficiency) {
      components.push(
        <MinMaxSlider
          key={`${type}_eff`}
          label="Efficiency"
          min={config.efficiency.min}
          max={config.efficiency.max}
          initialValue={filters?.efficiency ? [filters.efficiency.min, filters.efficiency.max] : undefined}
          onChange={(range) => setFilter("efficiency", range)}
        />,
      );
    }
    if (config.density) {
      components.push(
        <MinMaxSlider
          key={`${type}_density`}
          label="Density"
          min={config.density.min}
          max={config.density.max}
          initialValue={filters?.density ? [filters.density.min, filters.density.max] : undefined}
          onChange={(range) => setFilter("density", range)}
        />,
      );
    }

    return components;
  }, [type]);

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Quest Rate</DrawerTitle>
        <DrawerDescription>Set the rate you are willing to pay for a quest.</DrawerDescription>
      </DrawerHeader>
      <div className="no-scrollbar overflow-y-auto px-4 flex flex-col gap-4">
        <QuestTypeSelect value={type} onChange={setType} disabled={Boolean(rate)} />

        {type > 0 && (
          <>
            <PriceSlider value={amount} onChange={setAmount} />
            <FieldLabel htmlFor="switch-focus-mode">
              <Field orientation="horizontal" className="max-w-sm">
                <FieldContent>
                  <FieldTitle>Active</FieldTitle>
                  <FieldDescription>
                    You will receive quests when your status is set to open, and you have free slots
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
              defaultValue={Object.keys(filters).length > 0 ? "value" : undefined}
              type="single"
              collapsible
              className="max-w-lg rounded-lg border"
            >
              <AccordionItem value="value" className="border-b px-4 last:border-b-0">
                <AccordionTrigger>Advanced Filter</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-8">{sliders}</AccordionContent>
              </AccordionItem>
            </Accordion>

            <Card className="bg-transparent p-4">
              <FieldSet>
                <FieldLegend variant="label">Stack Groups</FieldLegend>
                <FieldGroup>
                  <div className="flex flex-wrap gap-2">
                    {toggles.map((t) => (
                      <Field key={t.id} orientation="horizontal">
                        <Checkbox id={t.id} checked={groups.includes(t.id)} onClick={() => toggleGroup(t.id)} />
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
