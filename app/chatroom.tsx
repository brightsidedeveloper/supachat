import { useGlobalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Alert,
} from 'react-native'
import supabase from '../lib/supabase'
import useSession from '../hooks/useSession'
import getCurrentTimestamp from '../utils/getCurrentTimestamp'
import { useQuery } from '@supabase-cache-helpers/postgrest-swr'
//TODO import usePushNotifications from "../hooks/usePushNotifications"

interface Message {
  id: string
  text: string
  content?: string
  data?: string[]
  created_at: any
  sender_id?: string
}

const Chatroom = () => {
  //TODO const { notification } = usePushNotifications()
  const { session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const flatListRef = useRef<FlatList>(null)
  const { id: group_id } = useGlobalSearchParams()

  const router = useRouter()

  const { data: msgs } = useQuery(
    supabase
      .from('message')
      .select('*')
      .eq('group_id', group_id)
      .order('created_at', { ascending: true })
      .range(0, 20)
  )

  useEffect(() => setMessages(msgs?.reverse() || []), [msgs])

  const messageReceived = useCallback(
    ({ payload }: { event: string; payload: Message }) => {
      const newMessage = payload
      setMessages(prevMessages =>
        [...prevMessages, newMessage].sort((a, b) => {
          const dateA = new Date(a.created_at)
          const dateB = new Date(b.created_at)

          return dateB.getTime() - dateA.getTime()
        })
      )
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: 0, animated: true })
        }
      }, 100)
    },
    []
  )
  const realtimeChannelRef = useRef<any>()

  const realtime = useCallback(() => {
    realtimeChannelRef.current = supabase.channel(group_id as string, {
      config: {
        broadcast: { self: true },
      },
    })
    realtimeChannelRef.current
      .on('broadcast', { event: 'msg' }, messageReceived)
      .subscribe()

    return () => {
      realtimeChannelRef.current.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!group_id || !session) return router.replace('/(tabs)/two')
    return realtime()
  }, [group_id, session, router])

  const handleSendMessage = async () => {
    if (inputText.trim() !== '') {
      const { error } = await supabase
        .from('message')
        .insert([
          { content: inputText, sender_id: session?.user?.id, group_id },
        ])
        .select()
      if (error) Alert.alert(error.message)
      setInputText('')
    }
    const randomId = Math.random().toString(36).substring(7)
    realtimeChannelRef.current.send({
      type: 'broadcast',
      event: 'msg',
      payload: {
        id: randomId,
        content: inputText,
        sender_id: session?.user?.id,
        group_id,
        created_at: getCurrentTimestamp(),
      },
    })
  }

  const renderItem = ({ item: { content, sender_id } }: { item: Message }) => {
    const isMe = session?.user?.id === sender_id
    return (
      <View
        style={{
          alignItems: isMe ? 'flex-end' : 'flex-start',
          margin: 5,
        }}
      >
        <View
          style={{
            backgroundColor: isMe ? '#007AFF' : '#4CAF50',
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff' }}>{content}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        style={{ flex: 1, marginBottom: 50 }}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        inverted
      />
      <KeyboardAvoidingView
        behavior='padding'
        keyboardVerticalOffset={100}
        style={{
          bottom: 50,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          position: 'sticky',
        }}
      >
        <TextInput
          style={{
            flex: 1,
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 10,
            marginRight: 10,
            padding: 5,
            color: '#fff',
          }}
          placeholder='Type your message...'
          value={inputText}
          onChangeText={text => setInputText(text)}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <View
            style={{
              backgroundColor: '#007AFF',
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff' }}>Send</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={{ marginLeft: 10 }}>
          <View
            style={{
              backgroundColor: '#4CAF50',
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff' }}>Upload Media</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Chatroom
