import { UseFormReturn } from 'react-hook-form';
import Input from "@/components/common/Input";
import { TempoFormValues } from '@/types/Tempo';

interface InputSectionProps {
  methods: UseFormReturn<TempoFormValues>;
  setFormValue: (key: keyof TempoFormValues, value: string) => void;
}

export default function InputSection({ methods, setFormValue }: InputSectionProps) {
  const handleInputChange = (key: keyof TempoFormValues, value: string) => {
    methods.setValue(key, value, { shouldValidate: true });
    setFormValue(key, value);
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex justify-start gap-3'>
        <Input
          name="eccentric"
          label="수축(초)"
          placeholder='숫자만 입력하세요.'
          width='w-[10rem]'
          type="number"
          inputMode="numeric"
          onChange={(e) => handleInputChange("eccentric", e.target.value)}
          rules={{
            required: '필수 입력입니다.',
            pattern: {
              value: /^[0-9]+$/,
              message: '숫자만 입력 가능합니다.',
            },
            validate: value => Number(value) <= 10 || '10까지 입력 가능합니다.'
          }}
        />
        <Input
          name="concentric"
          label="이완(초)"
          placeholder='숫자만 입력하세요.'
          width='w-[10rem]'
          type="number"
          inputMode="numeric"
          onChange={(e) => handleInputChange("concentric", e.target.value)}
          rules={{
            required: '필수 입력입니다.',
            pattern: {
              value: /^[0-9]+$/,
              message: '숫자만 입력 가능합니다.',
            },
            validate: value => Number(value) <= 10 || '10까지 입력 가능합니다.'
          }}
        />
      </div>
      <div className='flex justify-start gap-3'>
        <Input
          name="reps"
          label="운동 횟수(reps)"
          placeholder='숫자만 입력하세요.'
          width='w-[10rem]'
          type="number"
          inputMode="numeric"
          onChange={(e) => handleInputChange("reps", e.target.value)}
          rules={{
            required: '필수 입력입니다.',
            pattern: {
              value: /^[0-9]+$/,
              message: '숫자만 입력 가능합니다.',
            },
            validate: value => Number(value) <= 20 || '20까지 입력 가능합니다.'
          }}
        />
        <Input
          name="sets"
          label="세트수(set)"
          placeholder='숫자만 입력하세요.'
          width='w-[10rem]'
          type="number"
          inputMode="numeric"
          onChange={(e) => handleInputChange("sets", e.target.value)}
          rules={{
            required: '필수 입력입니다.',
            pattern: {
              value: /^[0-9]+$/,
              message: '숫자만 입력 가능합니다.',
            },
            validate: value => Number(value) <= 10 || '10까지 입력 가능합니다.'
          }}
        />
      </div>
      <Input
        name="rests"
        label="휴식 시간(초)"
        placeholder='숫자만 입력하세요.'
        width='w-[21rem]'
        type="number"
        inputMode="numeric"
        onChange={(e) => handleInputChange("rests", e.target.value)}
        rules={{
          required: '필수 입력입니다.',
          pattern: {
            value: /^[0-9]+$/,
            message: '숫자만 입력 가능합니다.',
          },
          validate: value => Number(value) <= 600 || '600까지 입력 가능합니다.'
        }}
      />
    </div>
  );
}