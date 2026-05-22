interface AcceptRoutineCycleFeaturePromptParams {
  enableRoutine: () => Promise<void>
  closeFeatureAlert: () => void
  openRoutineSettings: () => void
}

export async function acceptRoutineCycleFeaturePrompt({
  enableRoutine,
  closeFeatureAlert,
  openRoutineSettings,
}: AcceptRoutineCycleFeaturePromptParams) {
  await enableRoutine()
  closeFeatureAlert()
  openRoutineSettings()
}
