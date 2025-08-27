"use client";

import { memo, ReactNode, useState, useCallback, ChangeEventHandler, InputHTMLAttributes } from "react";
import { RegisterOptions, useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import Invisibility from "@/asset/ic/ic_invisibility.svg";
import Visibility from "@/asset/ic/ic_visibility.svg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** RHF name속성 */
  name: string;
  /** input label 설정 */
  label?: string | ReactNode;
  /** input placeholder 설정 */
  placeholder?: string;
  /** input type 설정 */
  type?: 'text' | 'password' | 'number';
  /** input의 너비 클래스 */
  width?: string;
  /** 추가 클래스명 */
  className?: string;
  /** onFocus 이벤트 등록 */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** onBlur 이벤트 등록 */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** onChange 이벤트 등록 */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** register 를 호출할 때 지정하는 유효성 검사 규칙과 같은 포맷 */
  rules?: RegisterOptions;
  /** 최소 입력 글자수 */
  minLength?: number;
  /** 최대 입력 글자수 */
  maxLength?: number;
}

function Input({ 
  name, 
  label, 
  placeholder, 
  type, 
  width, 
  className, 
  onFocus, 
  onBlur, 
  onChange, 
  rules, 
  minLength, 
  maxLength, 
  ...props
}: InputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const IsPwd = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const IsError = errors[name];

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.target.value;
    setValue(name, newValue);
    if (onChange) {
      onChange(e);
    }
  };

  const onInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) {
        onFocus(e);
      }
    },
    [onFocus],
  );

  const onInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e);
      }
    },
    [onBlur],
  );

  const { ref, ...rest } = register(name, {
    onChange: handleChange,
    onBlur: onInputBlur,
    ...rules,
    shouldUnregister: false,
  });


  return (
    <div className="flex flex-col gap-[0.5rem]">
      <label 
        htmlFor={name}
        className="block"
      >
        {label}
      </label>
      <div className={`relative ${width} ${className}`}>
        <input 
          id={name}
          type={IsPwd ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={`h-[3rem] w-full rounded-lg border-0 bg-[#34343A] px-[1rem] py-[1rem] ${
            IsError
              ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
              : 'focus-within:ring-0 focus-within:outline-none'
          }`}
          onFocus={onInputFocus}
          minLength={minLength}
          maxLength={maxLength}
          {...rest}
        />
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
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p className="mt-1 text-sm text-red-500">{message}</p>
        )}
      />
    </div>
  );
}

export default memo(Input);