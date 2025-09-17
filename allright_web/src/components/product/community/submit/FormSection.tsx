"use client";

import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { Button } from "@/components/ui/button";

interface FormValues {
  title: string;
  content: string;
  category: string;
};

export default function FormSection() {
  const methods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // 여기서 서버 액션 호출/업로드 로직 연결
    console.log("submit:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10 max-w-screen-lg mx-auto">
        <InputPair
          label="제목"
          name="title"
          id="title"
          description="40글자 이하로 작성"
          required
          placeholder="제목을 입력하세요."
        />
        <SelectPair
          required
          name="category"
          label="Category"
          description="주제와 맞는 토픽을 고르세요"
          placeholder="토픽"
          options={[
            { label: "토픽1", value: "topic1" },
            { label: "토픽2", value: "topic2" },
            { label: "토픽3", value: "topic3" },
          ]}
        />
        <InputPair
          label="내용"
          name="content"
          id="content"
          description="1000자 이하로 작성"
          required
          isTextArea
        />
        <Button className="mx-auto">생성하기</Button>
      </form>
    </FormProvider>
  );
}