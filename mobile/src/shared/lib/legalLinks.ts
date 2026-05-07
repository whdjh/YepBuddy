import Constants from "expo-constants"
import { Linking } from "react-native"

type LegalLinkConfig = {
  privacyPolicyUrl?: string
  supportUrl?: string
}

const legalLinkConfig = Constants.expoConfig?.extra as LegalLinkConfig | undefined
const WEB_URL_PATTERN = /^https?:\/\/\S+$/i

export function getSafeWebUrl(value?: string | null) {
  const url = value?.trim() ?? ""
  return WEB_URL_PATTERN.test(url) ? url : ""
}

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
