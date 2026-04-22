import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'

// 사운드 에셋
const SOURCES = {
  pip: require('../../../../assets/sounds/tempo/pip.wav'),
  pik: require('../../../../assets/sounds/tempo/pik.wav'),
  restStart: require('../../../../assets/sounds/tempo/rest-start.mp3'),
  restWarning: require('../../../../assets/sounds/tempo/rest-warning.mp3'),
} as const

const COUNT_SOURCES = [
  require('../../../../assets/sounds/count/1.mp3'),
  require('../../../../assets/sounds/count/2.mp3'),
  require('../../../../assets/sounds/count/3.mp3'),
  require('../../../../assets/sounds/count/4.mp3'),
  require('../../../../assets/sounds/count/5.mp3'),
  require('../../../../assets/sounds/count/6.mp3'),
  require('../../../../assets/sounds/count/7.mp3'),
  require('../../../../assets/sounds/count/8.mp3'),
  require('../../../../assets/sounds/count/9.mp3'),
  require('../../../../assets/sounds/count/10.mp3'),
  require('../../../../assets/sounds/count/11.mp3'),
  require('../../../../assets/sounds/count/12.mp3'),
  require('../../../../assets/sounds/count/13.mp3'),
  require('../../../../assets/sounds/count/14.mp3'),
  require('../../../../assets/sounds/count/15.mp3'),
  require('../../../../assets/sounds/count/16.mp3'),
  require('../../../../assets/sounds/count/17.mp3'),
  require('../../../../assets/sounds/count/18.mp3'),
  require('../../../../assets/sounds/count/19.mp3'),
  require('../../../../assets/sounds/count/20.mp3'),
] as const

let players: Record<string, AudioPlayer> | null = null
// 카운트 전용 단일 플레이어
let countPlayer: AudioPlayer | null = null
let initPromise: Promise<void> | null = null

/** 오디오 모드 설정 및 사운드 플레이어를 필요할 때 1회만 준비한다. */
export async function initAudio(): Promise<void> {
  if (players && countPlayer) {
    return
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    await setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    })

    players = {
      pip: createAudioPlayer(SOURCES.pip),
      pik: createAudioPlayer(SOURCES.pik),
      restStart: createAudioPlayer(SOURCES.restStart),
      restWarning: createAudioPlayer(SOURCES.restWarning),
    }

    countPlayer = createAudioPlayer(COUNT_SOURCES[0])
  })()

  try {
    await initPromise
  } finally {
    initPromise = null
  }
}

/** 오디오 플레이어 정리하고 템포 화면 언마운트 시 호출 */
export async function cleanupAudio(): Promise<void> {
  initPromise = null
  if (players) {
    Object.values(players).forEach((p) => p.remove())
    players = null
  }
  if (countPlayer) {
    countPlayer.remove()
    countPlayer = null
  }
}

function play(key: string): void {
  const player = players?.[key]
  if (!player) return
  player.seekTo(0)
  player.play()
}

export function playContractionTick(): void {
  play('pip')
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

export function playRelaxationTick(): void {
  play('pik')
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

export function playRestStart(): void {
  play('restStart')
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
}

export function playRestWarning(): void {
  play('restWarning')
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
}

export function playCount(rep: number): void {
  if (!countPlayer) return
  const index = rep - 1
  if (index < 0 || index >= COUNT_SOURCES.length) return
  countPlayer.replace(COUNT_SOURCES[index])
  countPlayer.play()
}

export function playComplete(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}
