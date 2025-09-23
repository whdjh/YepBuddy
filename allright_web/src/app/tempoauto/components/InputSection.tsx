import InputPair from '@/components/common/InputPair';

export default function InputSection() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex justify-start gap-3'>
        <InputPair
          label="수축(초)"
          description="수축 시간을 적어보세요."
          required
          id="concentric"
          name="concentric"
          rules={{ required: "수축시간을 입력하세요" }}
        />
        <InputPair
          label="이완(초)"
          description="이완 시간을 적어보세요."
          required
          id="eccentric"
          name="eccentric"
          rules={{ required: "이완시간을 입력하세요" }}
        />
      </div>
      <div className='flex justify-start gap-3'>
        <InputPair
          label="운동 횟수(reps)"
          description="운동 횟수을 적어보세요."
          required
          id="reps"
          name="reps"
          rules={{ required: "운동횟수을 입력하세요" }}
        />
        <InputPair
          label="세트수(set)"
          description="세트수를 적어보세요."
          required
          id="sets"
          name="sets"
          rules={{ required: "세트수를 입력하세요" }}
        />
      </div>
      <div className='flex justify-start gap-3'>
        <InputPair
          label="휴식 시간(초)"
          description="휴식 시간을 적어보세요."
          required
          id="rests"
          name="rests"
          rules={{ required: "휴식 시간을 입력하세요" }}
        />
        <InputPair
          label="운동 이름"
          description="운동명을 적어보세요."
          required
          id="name"
          name="name"
          rules={{ required: "운동명을 입력하세요" }}
        />
      </div>
    </div>
  );
}