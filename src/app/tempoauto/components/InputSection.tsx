import InputPair from '@/components/common/InputPair';

export default function InputSection() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex justify-start gap-3'>
        <InputPair
          label="수축(초)"
          description="최대 10초까지 가능합니다."
          required
          id="concentric"
          name="concentric"
          inputMode="numeric"
          pattern="[0-9]*"
          rules={{
            required: "수축시간을 입력하세요",
            min: { value: 1, message: "1초 이상 입력하세요" },
            max: { value: 10, message: "최대 10초까지 가능합니다" },
            pattern: {
              value: /^[0-9]+$/,
              message: "숫자만 입력 가능합니다",
            },
          }}
        />
        <InputPair
          label="이완(초)"
          description="최대 10초까지 가능합니다."
          required
          id="eccentric"
          name="eccentric"
          rules={{
            required: "이완시간을 입력하세요",
            min: { value: 1, message: "1초 이상 입력하세요" },
            max: { value: 10, message: "최대 10초까지 가능합니다" },
            pattern: {
              value: /^[0-9]+$/,
              message: "숫자만 입력 가능합니다",
            },
          }}
        />
      </div>
      <div className='flex justify-start gap-3'>
        <InputPair
          label="운동 횟수(reps)"
          description="최대 20개까지 가능합니다."
          required
          id="reps"
          name="reps"
          rules={{
            required: "운동횟수를 입력하세요",
            min: { value: 1, message: "1개 이상 입력하세요" },
            max: { value: 20, message: "최대 20개까지 가능합니다" },
            pattern: {
              value: /^[0-9]+$/,
              message: "숫자만 입력 가능합니다",
            },
          }}
        />
        <InputPair
          label="세트수(set)"
          description="최대 10세트까지 가능합니다."
          required
          id="sets"
          name="sets"
          rules={{
            required: "세트수를 입력하세요",
            min: { value: 1, message: "1세트 이상 입력하세요" },
            max: { value: 10, message: "최대 10세트까지 가능합니다" },
            pattern: {
              value: /^[0-9]+$/,
              message: "숫자만 입력 가능합니다",
            },
          }}
        />
      </div>
      <div className='flex justify-start gap-3'>
        <InputPair
          label="휴식 시간(초)"
          description="최대 300초까지 가능합니다."
          required
          id="rests"
          name="rests"
          rules={{
            required: "휴식 시간을 입력하세요",
            min: { value: 10, message: "10초 이상 입력하세요" },
            max: { value: 300, message: "최대 300초까지 가능합니다" },
            pattern: {
              value: /^[0-9]+$/,
              message: "숫자만 입력 가능합니다",
            },
          }}
        />
        <InputPair
          label="운동명"
          description="영어 또는 한글로 적어주세요."
          required
          id="name"
          name="name"
          rules={{
            required: "운동명을 입력하세요",
            pattern: {
              value: /^[A-Za-z가-힣\s]+$/,
              message: "운동 이름은 영어와 한국어만 가능합니다",
            },
          }}
        />
      </div>
    </div>
  );
}