import { memo, ReactNode, useState, useCallback, ChangeEventHandler, InputHTMLAttributes } from "react";
import { RegisterOptions, useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InputPairProps extends InputHTMLAttributes<HTMLInputElement> {
  /** RHF name속성 */
  name: string;
  /** input label 설정 */
  label?: string | ReactNode;
  /** flag */
  isTextArea?: boolean;
  /** input placeholder 설정 */
  placeholder?: string;
  /** input type 설정 */
  type?: 'text' | 'password' | 'number';
  /** 간략한 설명 */
  description: string;
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

function InputPair({
  name,
  label,
  isTextArea,
  placeholder,
  type,
  description,
  onFocus,
  onBlur,
  onChange,
  rules,
  minLength,
  maxLength,
}: InputPairProps & React.InputHTMLAttributes<HTMLInputElement>) {
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
    <div className="space-y-2 flex flex-col">
      <Label htmlFor={name} className="flex flex-col items-start gap-1">
        {label}
        <small className="text-muted-foreground">{description}</small>
      </Label>
      {isTextArea ? (
        <Textarea rows={4} className="resize-none" {...rest} />
      ) : (
          <Input
            id={name}
            type={IsPwd ? (showPassword ? 'text' : 'password') : type}
            placeholder={placeholder}
            className={`border border-white/10 h-[3rem] w-full rounded-lg bg-transparents px-[1rem] py-[1rem] ${IsError
                ? 'border-[#16a34a] focus-within:border-[#16a34a] focus-within:ring-[#16a34a]'
                : 'focus-within:ring-0 focus-within:outline-none'
              }`}
            onFocus={onInputFocus}
            minLength={minLength}
            maxLength={maxLength}
            {...rest}
          />
      )}
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p className="mt-1 text-sm text-[#16a34a]">{message}</p>
        )}
      />
    </div>
  );
}

export default memo(InputPair);