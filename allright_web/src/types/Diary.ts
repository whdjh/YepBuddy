export interface EventData {
  id: string;
  date: string;
  title: string;
  type: 'event' | 'holiday' | 'task';
}

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
