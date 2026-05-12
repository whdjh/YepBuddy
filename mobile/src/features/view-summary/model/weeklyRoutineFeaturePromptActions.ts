interface AcceptWeeklyRoutineFeaturePromptParams {
  enableRoutine: () => Promise<void>
  closeFeatureAlert: () => void
  openRoutineSettings: () => void
}

export async function acceptWeeklyRoutineFeaturePrompt({
  enableRoutine,
  closeFeatureAlert,
  openRoutineSettings,
}: AcceptWeeklyRoutineFeaturePromptParams) {
  await enableRoutine()
  closeFeatureAlert()
  openRoutineSettings()
}
