"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EvaluationStatus } from "@/types/Diary";

interface StatusCheckProps {
  labels: Array<keyof EvaluationStatus>;
  value: EvaluationStatus;
  onChange: (next: EvaluationStatus) => void;
}

export default function StatusCheck({ labels, value, onChange }: StatusCheckProps) {
  const handleChange = (label: keyof EvaluationStatus, newValue: string) => {
    onChange({
      ...value,
      [label]: newValue,
    } as EvaluationStatus);
  };

  return (
    <div className="p-3 flex gap-5 justify-center items-center tab:justify-start">
      {labels.map((label) => (
        <DropdownMenu key={label}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {label}: {value[label]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuRadioGroup
              value={value[label]}
              onValueChange={(val) => handleChange(label, val)}
            >
              <DropdownMenuRadioItem value="상">상</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="중">중</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="하">하</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}
