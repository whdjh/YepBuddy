export interface Exercise {
  id: string;
  name: string;
  sets: Array<{
    weight: string;
    reps: string;
  }>;
}

export interface ExerciseData {
  selectedBodyParts: string[];
  exercises: Exercise[];
}
