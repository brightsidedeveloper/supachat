import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { useCallback, useEffect, useRef, useState } from "react"

import Constants from "expo-constants"
import { Platform } from "react-native"

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken
  notification?: Notifications.Notification
}

export default function usePushNotifications(): PushNotificationState {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >()

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >()

  const notificationListenerRef = useRef<Notifications.Subscription>()
  const responseListenerRef = useRef<Notifications.Subscription>()

  const registerDeviceForNotificiations = useCallback(async () => {
    if (!Device.isDevice)
      return alert("Must use physical device for Push Notifications")

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!")
      return
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      })
    }

    setExpoPushToken(token)
  }, [])

  useEffect(() => {
    registerDeviceForNotificiations()

    notificationListenerRef.current =
      Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification)
      })

    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response)
      })

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListenerRef.current!
      )
      Notifications.removeNotificationSubscription(responseListenerRef.current!)
    }
  })

  return {
    expoPushToken,
    notification,
  }
}
