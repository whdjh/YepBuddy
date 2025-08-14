"use client";

import { memo, ReactNode, useState, } from "react";
import Invisibility from "@/asset/ic/ic_Invisibility.svg";
import Visibility from "@/asset/ic/ic_visibility.svg";

interface InputProps {
  /** RHF name속성 */
  name: string;
  /** input label 설정 */
  label?: string | ReactNode;
  /** input placeholder 설정 */
  placeholder?: string;
  /** input type 설정 */
  type?: 'text' | 'password';
}

function Input({ name, label, placeholder, type }: InputProps) {
  const IsPwd = type === 'password';
  const [showPassword, setShowPassword] = useState(false);


  return (
    <>
      <div className="flex flex-col gap-[0.5rem]">
        <label 
          htmlFor={name}
          className="block"
        >
          {label}
        </label>
        <div className="relative">
          <div className="flex flex-row items-center gap-[0.5rem]">
            <input 
              id={name}
              type={IsPwd ? (showPassword ? 'text' : 'password') : type}
              placeholder={placeholder}
              className="h-[2.75rem] w-full rounded-lg border-0 bg-[#34343A] px-[1rem] py-[0.625rem]"
            />
          </div>
          {IsPwd && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2"
              aria-label="비밀번호 숨김 버튼"
            >
              {showPassword ? <Visibility /> : <Invisibility />} 
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(Input);