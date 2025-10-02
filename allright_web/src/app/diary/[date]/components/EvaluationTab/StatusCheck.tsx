"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusCheckTabProps {
  labels: string[];
}

export default function StatusCheck({ labels }: StatusCheckTabProps) {
  // 각 label별 선택값을 상태로 관리
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(labels.map((label) => [label, "중"]))
  );

  const handleChange = (label: string, newValue: string) => {
    setValues((prev) => ({
      ...prev,
      [label]: newValue,
    }));
  };

  return (
    <div className="p-3 flex gap-5 justify-center items-center tab:justify-start">
      {labels.map((label) => (
        <DropdownMenu key={label}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {label}: {values[label]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuRadioGroup
              value={values[label]}
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
