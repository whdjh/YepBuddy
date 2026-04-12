export interface TempoSettings {
  modeIndex: number; // 0 = 수축 우선, 1 = 이완 우선
  contraction: number; // 수축 시간 (초)
  relaxation: number; // 이완 시간 (초)
  reps: number; // 세트당 렙 수
  sets: number; // 총 세트 수
  rest: number; // 세트 간 휴식 시간 (초)
}

export interface TempoPosition {
  phase: 'contraction' | 'relaxation' | 'rest' | 'count';
  currentSet: number; // 1부터 시작
  currentRep: number; // 1부터 시작
  phaseElapsed: number; // 현재 단계 경과 시간 (ms)
  phaseDuration: number; // 현재 단계 총 시간 (ms)
  remainingRest: number | null; // 휴식 잔여 시간 (초)
  isFinished: boolean;
}

// 렙 완료 후 카운트 구간 (1초)
const COUNT_MS = 1000;

const FINISHED: TempoPosition = {
  phase: 'contraction',
  currentSet: 1,
  currentRep: 1,
  phaseElapsed: 0,
  phaseDuration: 0,
  remainingRest: null,
  isFinished: true,
};

export function calculateTempoPosition(
  elapsedMs: number,
  settings: TempoSettings,
): TempoPosition {
  const { modeIndex, contraction, relaxation, reps, sets, rest } = settings;

  const contractionMs = contraction * 1000;
  const relaxationMs = relaxation * 1000;
  const restMs = rest * 1000;
  // 렙 = 수축 + 이완 + 카운트(1초)
  const repMs = contractionMs + relaxationMs + COUNT_MS;
  const repsMs = repMs * reps;
  // 마지막 세트는 휴식 없음
  const setWithRestMs = repsMs + restMs;
  const lastSetMs = repsMs;
  const totalMs = sets <= 1 ? lastSetMs : setWithRestMs * (sets - 1) + lastSetMs;

  if (elapsedMs >= totalMs) {
    return FINISHED;
  }

  // 현재 세트 판별
  let remaining = elapsedMs;
  let currentSet = 1;

  while (currentSet < sets && remaining >= setWithRestMs) {
    remaining -= setWithRestMs;
    currentSet++;
  }

  // 현재 세트 내에서 렙 구간인지 휴식 구간인지 확인
  if (remaining >= repsMs) {
    // 휴식 단계 (마지막 세트 제외)
    const restElapsed = remaining - repsMs;
    const remainingRestMs = restMs - restElapsed;
    return {
      phase: 'rest',
      currentSet,
      currentRep: reps,
      phaseElapsed: restElapsed,
      phaseDuration: restMs,
      remainingRest: Math.ceil(remainingRestMs / 1000),
      isFinished: false,
    };
  }

  // 렙 내 단계 계산
  const currentRep = Math.floor(remaining / repMs) + 1;
  const repElapsed = remaining - (currentRep - 1) * repMs;

  // 모드에 따른 단계 순서 결정
  const firstPhase: 'contraction' | 'relaxation' =
    modeIndex === 0 ? 'contraction' : 'relaxation';
  const secondPhase: 'contraction' | 'relaxation' =
    modeIndex === 0 ? 'relaxation' : 'contraction';
  const firstDurationMs = modeIndex === 0 ? contractionMs : relaxationMs;
  const secondDurationMs = modeIndex === 0 ? relaxationMs : contractionMs;

  // 첫 번째 단계 (수축 or 이완)
  if (repElapsed < firstDurationMs) {
    return {
      phase: firstPhase,
      currentSet,
      currentRep,
      phaseElapsed: repElapsed,
      phaseDuration: firstDurationMs,
      remainingRest: null,
      isFinished: false,
    };
  }

  // 두 번째 단계 (이완 or 수축)
  const secondStart = firstDurationMs;
  if (repElapsed < secondStart + secondDurationMs) {
    return {
      phase: secondPhase,
      currentSet,
      currentRep,
      phaseElapsed: repElapsed - secondStart,
      phaseDuration: secondDurationMs,
      remainingRest: null,
      isFinished: false,
    };
  }

  // 카운트 단계 (렙 완료 후 1초)
  return {
    phase: 'count',
    currentSet,
    currentRep,
    phaseElapsed: repElapsed - secondStart - secondDurationMs,
    phaseDuration: COUNT_MS,
    remainingRest: null,
    isFinished: false,
  };
}
