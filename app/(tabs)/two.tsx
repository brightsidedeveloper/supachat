import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'

import { Text, View } from '../../components/Themed'
import { useCallback, useEffect, useState } from 'react'
import { create } from 'zustand'
import supabase from '../../lib/supabase'
import { Link, router, useRouter } from 'expo-router'
import useSession from '../../hooks/useSession'

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
    let { data: group, error } = await supabase.from('group').select('*')

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
        style={{ flex: 1, width: '100%' }}
        data={groups}
        renderItem={({ item: group }) => <Card {...group} />}
        keyExtractor={group => group.id}
      />
    </View>
  )
}

function Card({ id, name }: Group) {
  const { session } = useSession()
  const router = useRouter()
  const darkMode = useColorScheme() === 'dark'

  const cardContent = () => (
    <View
      style={{
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderColor: 'gray',
        maxHeight: 100,
        width: '100%',
        borderBottomWidth: 1,
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: 10,
          flex: 1,
        }}
      >
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            borderColor: darkMode ? '#fff' : '#000',
            borderWidth: 2,
          }}
          source={{ uri: 'https://placekitten.com/200/300' }}
        />
        <View style={{ width: '100%', gap: 5 }}>
          <Text style={{ fontWeight: 'bold' }}>{name}</Text>
          <Text>last message</Text>
        </View>
      </View>
      <Text>🔔</Text>
    </View>
  )

  const onPressNoSession = () => {
    alert('You must be logged in to view this group')
    router.push('/(tabs)')
  }

  if (!session)
    return (
      <TouchableOpacity onPress={onPressNoSession}>
        {cardContent()}
      </TouchableOpacity>
    )
  return <Link href={`/chatroom?id=${id}`}>{cardContent()}</Link>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
