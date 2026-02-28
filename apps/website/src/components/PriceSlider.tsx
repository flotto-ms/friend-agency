"use client";

import { useState } from "react";
import { Slider } from "./ui/slider";
import { Field, FieldLabel } from "./ui/field";

const PriceSlider: React.FC = () => {
  const [value, setValue] = useState([150]);
  return (
    <Field className="w-full">
      <FieldLabel>
        <div className="flex flex-1 items-center justify-between gap-2">
          <div>Price per Level</div>
          <span className="text-muted-foreground text-sm">{value[0]}</span>
        </div>
      </FieldLabel>

      <Slider
        id="slider-demo-temperature"
        value={value}
        onValueChange={(value) => setValue(value as number[])}
        min={150}
        max={500}
        step={10}
      />
    </Field>
  );
};

export default PriceSlider;
