"use client";

import { useState } from "react";
import { Slider } from "./ui/slider";
import { Field, FieldLabel } from "./ui/field";

export type PriceSliderProps = {
  min?: number;
  value: number;
  onChange: (val: number) => void;
};

const PriceSlider: React.FC<PriceSliderProps> = ({
  min = 120,
  value,
  onChange,
}) => {
  return (
    <Field className="w-full pb-2">
      <FieldLabel>
        <div className="flex flex-1 items-center justify-between gap-2">
          <div>Price per Level</div>
          <span className="text-muted-foreground text-sm">{value}</span>
        </div>
      </FieldLabel>

      <Slider
        id="slider-demo-temperature"
        value={[value]}
        onValueChange={(value) => onChange(value[0])}
        min={min}
        max={500}
        step={5}
      />
    </Field>
  );
};

export default PriceSlider;
