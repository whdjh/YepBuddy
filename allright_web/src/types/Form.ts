export interface LoginForm {
  email: string;
  password: string;
}

export interface JoinForm {
  name: string;
  email: string;
  password: string;
};

export interface UserSettingFormValues {
  name: string;
  role: string;
  location: string;
  history: string;
  qualifications: string;
  description: string;
  avatarFile?: File | null;
  avatar?: FileList | null; // 폼 내부 바인딩용이니 서버로 보내지 않도록 주의
}

export interface ManualTempoFormValues {
  name: string;
  reps: number | null;
}

export interface AutoTempoFormValues {
  concentric: string;
  eccentric: string;
  reps: string;
  sets: string;
  rests: string;
  name: string;
}

export interface SideCardFormValues {
  introduction: string;
}

export interface ReviewFormValue {
  rating: number;
  review: string;
};

export interface TrainerSubmitFormValues {
  program: string;
  proceed: string;
  schedule: string;
  price: string;
  intro: string;
  description: string;
};