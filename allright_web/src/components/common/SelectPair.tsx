"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Option {
  label: string;
  value: string
};

export default function SelectPair({
  name,
  required,
  label,
  description,
  placeholder,
  options,
}: {
  label: string;
  description: string;
  name: string;
  required?: boolean;
  placeholder: string;
  options: Option[];
}) {
  const [open, setOpen] = useState(false);
  const { control } = useFormContext();

  return (
    <div className="space-y-2 flex flex-col">
      <Label className="flex flex-col items-start gap-1" onClick={() => setOpen(true)}>
        {label}
        <small className="text-muted-foreground">{description}</small>
      </Label>

      <Controller
        name={name}
        control={control}
        rules={required ? { required: "카테고리를 선택하세요." } : undefined}
        render={({ field, fieldState }) => (
          <>
            <Select
              open={open}
              onOpenChange={setOpen}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
}
