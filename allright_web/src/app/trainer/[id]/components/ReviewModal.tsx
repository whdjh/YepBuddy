"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { StarIcon } from "lucide-react";
import InputPair from "@/components/common/InputPair";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type ReviewForm = {
  rating: number;
  review: string;
};

export default function ReviewModal() {
  const methods = useForm<ReviewForm>({
    mode: "onChange",
    defaultValues: {
      rating: 0,
      review: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const rating = watch("rating", 0);

  const onSubmit = (data: ReviewForm) => {
    console.log("review submit:", data);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-2xl">트레이너 평가</DialogTitle>
        <DialogDescription>
          트레이너에 대한 솔직한 평가를 남겨주세요.
        </DialogDescription>
      </DialogHeader>

      <FormProvider {...methods}>
        <form className="space-y-10" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <Label className="flex items-start flex-col gap-1">
              평점
              <small className="text-muted-foreground">
                몇 점을 주시겠어요?
              </small>
            </Label>

            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = hoveredStar >= star || (rating ?? 0) >= star;
                return (
                  <label
                    key={star}
                    className="relative cursor-pointer"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  >
                    <StarIcon
                      className="size-5 text-yellow-400"
                      fill={filled ? "currentColor" : "none"}
                    />
                    <input
                      type="radio"
                      value={star}
                      {...register("rating", {
                        required: "별점을 선택해주세요.",
                        valueAsNumber: true,
                      })}
                      className="absolute h-px w-px opacity-0"
                      aria-label={`${star} stars`}
                    />
                  </label>
                );
              })}
            </div>
            {errors.rating?.message && (
              <p className="mt-2 text-sm text-[#16a34a]">{String(errors.rating.message)}</p>
            )}
          </div>

          <InputPair
            name="review"
            isTextArea
            required
            label="리뷰"
            description="최대 1,000자 입력해주세요."
            placeholder="트레이너와의 경험을 자세히 알려주세요."
            rules={{
              required: "리뷰를 입력해주세요.",
              maxLength: { value: 1000, message: "최대 1000자까지 입력 가능합니다." },
            }}
          />

          <DialogFooter>
            <Button type="submit">리뷰 제출</Button>
          </DialogFooter>
        </form>
      </FormProvider>
    </DialogContent>
  );
}
