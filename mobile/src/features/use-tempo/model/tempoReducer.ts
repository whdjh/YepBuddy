export interface TempoState {
  modeIndex: number
  contraction: number
  relaxation: number
  reps: number
  sets: number
  rest: number
}

export type TempoAction =
  | { type: "SET_MODE"; payload: number }
  | { type: "SET_CONTRACTION"; payload: number }
  | { type: "SET_RELAXATION"; payload: number }
  | { type: "SET_REPS"; payload: number }
  | { type: "SET_SETS"; payload: number }
  | { type: "SET_REST"; payload: number }

export const initialTempoState: TempoState = {
  modeIndex: 0,
  contraction: 3,
  relaxation: 3,
  reps: 10,
  sets: 3,
  rest: 60,
}

export function tempoReducer(
  state: TempoState,
  action: TempoAction,
): TempoState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, modeIndex: action.payload === 1 ? 1 : 0 }
    case "SET_CONTRACTION":
      return { ...state, contraction: Math.max(1, action.payload) }
    case "SET_RELAXATION":
      return { ...state, relaxation: Math.max(1, action.payload) }
    case "SET_REPS":
      return { ...state, reps: Math.max(1, action.payload) }
    case "SET_SETS":
      return { ...state, sets: Math.max(1, action.payload) }
    case "SET_REST":
      return { ...state, rest: Math.max(0, action.payload) }
    default:
      return state
  }
}
