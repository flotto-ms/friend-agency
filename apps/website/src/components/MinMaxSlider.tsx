"use client";

import { useState } from "react";
import { Slider } from "./ui/slider";
import { Field, FieldLabel } from "./ui/field";
import { formatNumber } from "@/lib/FormatNumber";

type Props = {
  label: string;
  min: number;
  max: number;
  step?: number;
  initialValue?: [number, number];
  onChange?: (value?: { min: number; max: number }) => void;
};

const MinMaxSlider: React.FC<Props> = ({ label, min, max, step = 1, initialValue, onChange }) => {
  const [value, setValue] = useState(initialValue ?? [min, max]);

  const onChangeInternal = (value: number[]) => {
    setValue(value);
    if (!onChange) {
      return;
    }
    const range = { min: value[0], max: value[1] };
    if (range.min === min && range.max === max) {
      onChange(undefined);
    } else {
      onChange(range);
    }
  };
  return (
    <Field className="w-full pb-2">
      <FieldLabel>
        <div className="flex flex-1 items-center justify-between gap-2">
          <div>{label}</div>
          <span className="text-muted-foreground text-sm">
            {formatNumber(value[0])} to {formatNumber(value[1])}
          </span>
        </div>
      </FieldLabel>

      <Slider
        id="slider-demo-temperature"
        value={value}
        onValueChange={onChangeInternal}
        min={min}
        max={max}
        step={step}
      />
    </Field>
  );
};

export default MinMaxSlider;
