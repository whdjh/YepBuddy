import Constants from "expo-constants"

type LegalLinkConfig = {
  privacyPolicyUrl?: string
  supportUrl?: string
}

const legalLinkConfig = Constants.expoConfig?.extra as LegalLinkConfig | undefined

export const privacyPolicyUrl = legalLinkConfig?.privacyPolicyUrl ?? ""
export const supportUrl = legalLinkConfig?.supportUrl ?? ""
