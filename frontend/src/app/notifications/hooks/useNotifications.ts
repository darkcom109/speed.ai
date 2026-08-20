import { useEffect, useRef, useState } from "react"
import { getNotifications } from "@/app/notifications/api/notifications-api"
import type { AppNotification } from "@/app/notifications/types/notification"
import { toast } from "@/lib/single-toast"

const notificationPreferencesStorageKey = "speed-ai-notification-preferences"
const activeAlarmStorageKey = "speed-ai-active-alarm"

export type NotificationSoundType = "beep" | "double" | "chime"

function readStoredNotificationPreferences() {
  if (typeof window === "undefined") {
    return {
      browserAlertsEnabled: true,
      soundEnabled: false,
      soundVolume: 0.35,
      soundType: "beep" as NotificationSoundType,
    }
  }

  try {
    const rawValue = window.localStorage.getItem(notificationPreferencesStorageKey)

    if (!rawValue) {
      return {
        browserAlertsEnabled: true,
        soundEnabled: false,
        soundVolume: 0.35,
        soundType: "beep" as NotificationSoundType,
      }
    }

    const parsedValue = JSON.parse(rawValue) as {
      browserAlertsEnabled?: boolean
      soundEnabled?: boolean
      soundVolume?: number
      soundType?: NotificationSoundType
    }

    return {
      browserAlertsEnabled: parsedValue.browserAlertsEnabled ?? true,
      soundEnabled: parsedValue.soundEnabled ?? false,
      soundVolume: typeof parsedValue.soundVolume === "number" ? parsedValue.soundVolume : 0.35,
      soundType:
        parsedValue.soundType === "double" || parsedValue.soundType === "chime"
          ? parsedValue.soundType
          : "beep",
    }
  } catch {
    return {
      browserAlertsEnabled: true,
      soundEnabled: false,
      soundVolume: 0.35,
      soundType: "beep" as NotificationSoundType,
    }
  }
}

function readStoredActiveAlarm() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(activeAlarmStorageKey)

    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as AppNotification
  } catch {
    return null
  }
}

export default function useNotifications() {
  const initialPreferences = readStoredNotificationPreferences()
  const initialActiveAlarm = readStoredActiveAlarm()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeAlarm, setActiveAlarm] = useState<AppNotification | null>(initialActiveAlarm)
  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState(
    initialPreferences.browserAlertsEnabled
  )
  const [soundEnabled, setSoundEnabled] = useState(initialPreferences.soundEnabled)
  const [soundVolume, setSoundVolume] = useState(initialPreferences.soundVolume)
  const [soundType, setSoundType] = useState<NotificationSoundType>(initialPreferences.soundType)
  const seenNotificationIds = useRef(new Set<string>())
  const hasLoadedOnce = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const alarmTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(
      notificationPreferencesStorageKey,
      JSON.stringify({
        browserAlertsEnabled,
        soundEnabled,
        soundVolume,
        soundType,
      })
    )
  }, [browserAlertsEnabled, soundEnabled, soundVolume, soundType])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (activeAlarm) {
      window.localStorage.setItem(activeAlarmStorageKey, JSON.stringify(activeAlarm))
      return
    }

    window.localStorage.removeItem(activeAlarmStorageKey)
  }, [activeAlarm])

  function stopAlarmSound() {
    if (alarmTimerRef.current !== null) {
      window.clearInterval(alarmTimerRef.current)
      alarmTimerRef.current = null
    }

    const audioContext = audioContextRef.current
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.suspend()
    }
  }

  function playAlarmPattern(audioContext: AudioContext, alarmTitle?: string) {
    const createBeep = (frequency: number, duration = 0.55, delay = 0) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.value = frequency
      gainNode.gain.value = 0.0001

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const now = audioContext.currentTime + delay
      const peakVolume = Math.max(0.02, Math.min(0.6, soundVolume))

      gainNode.gain.setValueAtTime(0.0001, now)
      gainNode.gain.exponentialRampToValueAtTime(peakVolume, now + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      oscillator.start(now)
      oscillator.stop(now + duration + 0.05)
    }

    if (alarmTitle !== "Due Now") {
      createBeep(660, 0.45, 0)
      createBeep(880, 0.45, 0.22)
      createBeep(990, 0.5, 0.44)
      return
    }

    if (soundType === "double") {
      createBeep(880, 0.28, 0)
      createBeep(1040, 0.28, 0.4)
      return
    }

    if (soundType === "chime") {
      createBeep(660, 0.45, 0)
      createBeep(880, 0.45, 0.22)
      createBeep(990, 0.5, 0.44)
      return
    }

    createBeep(880, 0.55, 0)
  }

  function startAlarmSound() {
    if (!soundEnabled || typeof window === "undefined") {
      return
    }

    const AudioContextClass =
      window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextClass) {
      return
    }

    const audioContext = audioContextRef.current ?? new AudioContextClass()
    audioContextRef.current = audioContext

    void audioContext.resume()

    if (alarmTimerRef.current !== null) {
      window.clearInterval(alarmTimerRef.current)
    }

    if (activeAlarm?.title !== "Due Now") {
      playAlarmPattern(audioContext, activeAlarm.title)
      return
    }

    playAlarmPattern(audioContext, activeAlarm?.title)
    alarmTimerRef.current = window.setInterval(
      () => playAlarmPattern(audioContext, activeAlarm?.title),
      1200
    )
  }

  async function loadNotifications() {
    try {
      setError("")
      const loadedNotifications = await getNotifications()
      const previousIds = seenNotificationIds.current

      setNotifications(loadedNotifications)

      if (hasLoadedOnce.current) {
        const newNotifications = loadedNotifications.filter(
          (notification) => !previousIds.has(notification.id)
        )
        const nextAlarm =
          newNotifications.find((notification) => notification.title === "Due Now") ??
          newNotifications.find((notification) => notification.priority === "high") ??
          newNotifications[0] ??
          null

        newNotifications.forEach((notification) => {
          const shouldSkipToastForAlarm = nextAlarm?.id === notification.id

          if (browserAlertsEnabled && !shouldSkipToastForAlarm) {
            toast.info(notification.title, {
              description: notification.message,
              duration: 8000,
            })
          }
        })

        if (nextAlarm && !activeAlarm && browserAlertsEnabled) {
          setActiveAlarm(nextAlarm)
        }

        if (browserAlertsEnabled && typeof window !== "undefined" && "Notification" in window) {
          const canNotify = window.Notification.permission === "granted"

          if (canNotify) {
            newNotifications.forEach((notification) => {
              new window.Notification(notification.title, {
                body: notification.message,
                tag: notification.id,
              })
            })
          }
        }
      }

      seenNotificationIds.current = new Set(loadedNotifications.map((notification) => notification.id))
      hasLoadedOnce.current = true

    } 
    catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load notifications"
      )
    } 
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()

    window.addEventListener("tasks-updated", loadNotifications)
    const interval = window.setInterval(loadNotifications, 5000)

    return () => {
      window.removeEventListener("tasks-updated", loadNotifications)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (activeAlarm) {
      startAlarmSound()
      return
    }

    stopAlarmSound()
  }, [activeAlarm, soundEnabled])

  async function enableBrowserNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      throw new Error("Browser notifications are not supported in this browser")
    }

    const permission = await window.Notification.requestPermission()

    if (permission !== "granted") {
      throw new Error("Notification permission was not granted")
    }

    setBrowserAlertsEnabled(true)
    setSoundEnabled(true)
  }

  function disableBrowserNotifications() {
    setBrowserAlertsEnabled(false)
  }

  function enableSound() {
    setSoundEnabled(true)
  }

  function disableSound() {
    setSoundEnabled(false)
    stopAlarmSound()
  }

  function setNotificationSoundVolume(nextVolume: number) {
    const clampedVolume = Math.max(0, Math.min(1, nextVolume))
    setSoundVolume(clampedVolume)
  }

  function setNotificationSoundType(nextType: NotificationSoundType) {
    setSoundType(nextType)
  }

  function dismissAlarm() {
    setActiveAlarm(null)
    stopAlarmSound()
  }

  return {
    notifications,
    error,
    isLoading,
    activeAlarm,
    dismissAlarm,
    enableBrowserNotifications,
    disableBrowserNotifications,
    enableSound,
    disableSound,
    setNotificationSoundVolume,
    setNotificationSoundType,
    browserAlertsEnabled,
    soundEnabled,
    soundVolume,
    soundType,
    canShowBrowserNotifications: typeof window !== "undefined" && "Notification" in window,
    browserNotificationPermission:
      typeof window !== "undefined" && "Notification" in window ? window.Notification.permission : "default",
  }
}
