export interface DiaryDatas {
  id: string;
  name: string;
  date: string;
  color: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Array<{ weight: string; reps: string }>;
}

export interface ExerciseData {
  selectedBodyParts: string[];
  exercises: Exercise[];
}

export interface EvaluationStatus {
  숙면상태: "상" | "중" | "하";
  컨디션: "상" | "중" | "하";
  활동강도: "상" | "중" | "하";
}

export interface EvaluationData {
  status: EvaluationStatus;
  comment: string;
  signatureData: string;
}
