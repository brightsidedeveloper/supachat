import { Button, StyleSheet } from "react-native"

import { Text, View } from "../../components/Themed"
import useSession from "../../hooks/useSession"
import Auth from "../../components/Auth"

export default function TabOneScreen() {
  const { session, logout } = useSession()
  return (
    <View style={styles.container}>
      {session ? <Button title="Logout" onPress={logout} /> : <Auth />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
})
