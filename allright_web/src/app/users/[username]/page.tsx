"use client";

import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { useState } from "react";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormValues {
  name: string;
  tags: string;
  description: string;
  category: string;
  icon: File | null;
};

export default function UserProfile() {
  const methods = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      tags: "",
      description: "",
      category: "",
      icon: null,
    },
  });
  
  const { handleSubmit } = methods;
  const [avatar, setAvatar] = useState<string | null>(null);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setAvatar(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // 여기서 서버 액션 호출/업로드 로직 연결
    console.log("submit:", data);
  };

  return (
    <div className="space-y-20 p-15">
      <div className="grid grid-cols-6 gap-40">
        <div className="col-span-4 flex flex-col gap-10">
          <h2 className="text-2xl font-semibold">Edit profile</h2>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-1/2 gap-5">
            <InputPair
              label="Name"
              description="Your public name"
              required
              id="name"
              name="name"
              placeholder="John Doe"
            />
            <SelectPair
              label="Role"
              description="What role do you do identify the most with"
              name="role"
              placeholder="Select a role"
              options={[
                { label: "Developer", value: "developer" },
                { label: "Designer", value: "designer" },
                { label: "Product Manager", value: "product-manager" },
                { label: "Founder", value: "founder" },
                { label: "Other", value: "other" },
              ]}
            />
            <InputPair
              label="Bio"
              description="Your public bio. It will be displayed on your profile page."
              required
              id="bio"
              name="bio"
              placeholder="John Doe"
              isTextArea
            />
            <Button className="w-full">Update profile</Button>
            </form>
          </FormProvider>
        </div>
        <aside className="col-span-2 p-6 rounded-lg border border-white/10 shadow-md">
          <Label className="flex flex-col gap-1">
            Avatar
            <small className="text-muted-foreground">
              This is your public avatar.
            </small>
          </Label>
          <div className="space-y-5">
            <div className="size-40 rounded-full shadow-xl overflow-hidden ">
              {avatar ? (
                <img src={avatar} className="object-cover w-full h-full" />
              ) : null}
            </div>
            <Input
              type="file"
              className="w-1/2"
              onChange={onChange}
              required
              name="icon"
            />
            <div className="flex flex-col text-xs">
              <span className=" text-muted-foreground">
                Recommended size: 128x128px
              </span>
              <span className=" text-muted-foreground">
                Allowed formats: PNG, JPEG
              </span>
              <span className=" text-muted-foreground">Max file size: 1MB</span>
            </div>
            <Button className="w-full">Update avatar</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}