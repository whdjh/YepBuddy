import InputPair from "@/components/common/InputPair";
import SelectPair from "@/components/common/SelectPair";
import { PARTNER_TYPES, LOCATION_TYPES, TIME_RANGE } from "@/constants/partner";

export default function FormSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-10">
      <InputPair
        label="구하는 사람"
        description="최대 40자"
        name="position"
        maxLength={40}
        placeholder="예) 상체 위주 파트너"
        rules={{ required: "필수 입력입니다." }}
      />

      <InputPair
        label="자기소개"
        description="최대 400자"
        name="overview"
        maxLength={400}
        placeholder="예) 3년 경력, 주 3회 오전 가능"
        isTextArea
        rules={{ required: "필수 입력입니다." }}
      />

      <InputPair
        label="선호하는 사람"
        description="최대 400자, 쉼표로 구분"
        name="responsibilities"
        maxLength={400}
        placeholder="예) 시간 엄수, 상체 선호, 가벼운 러닝 가능"
        isTextArea
        rules={{ required: "필수 입력입니다." }}
      />

      <InputPair
        label="약력"
        description="최대 400자, 쉼표로 구분"
        name="qualifications"
        maxLength={400}
        placeholder="예) 생체 2급, PT 3년"
        isTextArea
        rules={{ required: "필수 입력입니다." }}
      />

      <InputPair
        label="장점"
        description="최대 400자, 쉼표로 구분"
        name="benefits"
        maxLength={400}
        placeholder="예) 시간 엄수, 커뮤니케이션 좋음"
        isTextArea
        rules={{ required: "필수 입력입니다." }}
      />

      <InputPair
        label="헬스장 이름"
        description="최대 40자"
        name="gymName"
        maxLength={40}
        placeholder="예) 헬스메이트"
        rules={{ required: "필수 입력입니다." }}
      />

      {/** 파일로 변경 예정 */}
      <InputPair
        label="이미지 URL"
        description="URL 입력"
        name="gymLogoUrl"
        placeholder="예) https://example.com/logo.png"
      />

      <InputPair
        label="헬스장 위치"
        description="최대 40자"
        name="gymLocation"
        maxLength={40}
        placeholder="예) 서울 강남"
        rules={{ required: "필수 입력입니다." }}
      />

      <SelectPair
        label="파트너 타입"
        description="유형을 선택하세요"
        name="partnerType"
        required
        placeholder="선택"
        options={PARTNER_TYPES.map((t) => ({ label: t.label, value: t.value }))}
      />

      <SelectPair
        label="운동 방식"
        description="어떻게 운동할지 선택하세요"
        name="partnerLocation"
        required
        placeholder="선택"
        options={LOCATION_TYPES.map((l) => ({ label: l.label, value: l.value }))}
      />

      <SelectPair
        label="가능 시간대"
        description="시간대를 선택하세요"
        name="timeRange"
        required
        placeholder="선택"
        options={TIME_RANGE.map((time) => ({ label: time, value: time }))}
      />
    </div>
  );
}