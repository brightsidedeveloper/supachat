import { FlatList, StyleSheet } from "react-native"

import { Text, View } from "../../components/Themed"
import { useCallback, useEffect, useState } from "react"
import { create } from "zustand"
import supabase from "../../lib/supabase"
import { Link } from "expo-router"

interface Group {
  id: string
  name: string
  users: string[]
}

interface GroupStore {
  groups: Group[]
  loading: boolean
  setGroups: (groups: Group[]) => void
}

const useGroups = create<GroupStore>(set => ({
  groups: [],
  loading: true,
  setGroups: groups => set({ groups, loading: false }),
}))

export default function TabTwoScreen() {
  const { groups, loading, setGroups } = useGroups()

  const getGroups = useCallback(async () => {
    let { data: group, error } = await supabase.from("group").select("*")

    if (error) console.log(error)
    else setGroups(group as Group[])
  }, [])

  useEffect(() => {
    getGroups()
  }, [])

  return (
    <View style={styles.container}>
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={groups}
        renderItem={({ item: group }) => <Card {...group} />}
        keyExtractor={group => group.id}
      />
    </View>
  )
}

function Card({ id, name }: Group) {
  return (
    <Link href={`/chatroom?id=${id}`}>
      <Text>{name}</Text>
    </Link>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
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
