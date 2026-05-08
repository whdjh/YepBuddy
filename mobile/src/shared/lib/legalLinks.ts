import Constants from "expo-constants"
import { Linking } from "react-native"
import { getSafeWebUrl } from "./url"

export { getSafeWebUrl } from "./url"

type LegalLinkConfig = {
  privacyPolicyUrl?: string
  supportUrl?: string
}

const legalLinkConfig = Constants.expoConfig?.extra as LegalLinkConfig | undefined

export async function openWebUrl(value?: string | null) {
  const url = getSafeWebUrl(value)
  if (!url) {
    return false
  }

  try {
    await Linking.openURL(url)
    return true
  } catch {
    return false
  }
}

export const privacyPolicyUrl = getSafeWebUrl(legalLinkConfig?.privacyPolicyUrl)
export const supportUrl = getSafeWebUrl(legalLinkConfig?.supportUrl)
