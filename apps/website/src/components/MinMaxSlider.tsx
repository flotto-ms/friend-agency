"use client";

import { useState } from "react";
import { Slider } from "./ui/slider";
import { Field, FieldLabel } from "./ui/field";

const MinMaxSlider: React.FC = () => {
  const [value, setValue] = useState([0, 50_000]);
  return (
    <Field className="w-full">
      <FieldLabel>
        <div className="flex flex-1 items-center justify-between gap-2">
          <div>Filter Amount</div>
          <span className="text-muted-foreground text-sm">
            {value[0]} to {value[1]}
          </span>
        </div>
      </FieldLabel>

      <Slider
        id="slider-demo-temperature"
        value={value}
        onValueChange={(value) => setValue(value as number[])}
        min={0}
        max={50_000}
        step={1_000}
      />
    </Field>
  );
};

export default MinMaxSlider;
