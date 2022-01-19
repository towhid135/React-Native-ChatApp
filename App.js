// @refresh state
import React,{useState,useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,TextInput,Button } from 'react-native';
import * as firebase from 'firebase/app';
import { getDatabase, push, ref, set } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftedChat } from 'react-native-gifted-chat'

const firebaseConfig = {
  apiKey: "AIzaSyDoo5lAZoXqqgLOkkfjE_0bzmM-GqMN_ms",
  authDomain: "chatapp-7d527.firebaseapp.com",
  projectId: "chatapp-7d527",
  storageBucket: "chatapp-7d527.appspot.com",
  messagingSenderId: "271932805404",
  appId: "1:271932805404:web:80cccfc5344a7036fc2ad9"
};

const app = firebase.initializeApp(firebaseConfig);



export default function App() {
  const [user,setUser] = useState(null);
  const [name,setName] = useState('');
  const [messages,setMessages] = useState([]);

  useEffect(()=>{
    readUser();

  },[]);

  const readUser = async () =>{
    const userInfo = await AsyncStorage.getItem('user');
    if(userInfo){
      setUser(JSON.parse(userInfo))
    }
  }

  const handlePress = async () => {
    /*the _id would be the user id for a authenticated system. This is required for the
    react-native-gifted-chat library */
    const _id = Math.random().toString(36).substring(7)
    const user = { _id, name }
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  const handleSend = async (message) =>{

      const db = getDatabase();
      await push(ref(db, 'chat/'), {
        message: message,
      });

  }

  if(!user){
    return (
      <View style={styles.container}>
         <TextInput 
         style={styles.input} 
         placeholder="Enter your name" value={name} 
         onChangeText={setName} 
         />
          <Button 
          onPress={handlePress} 
          title="Enter the chat" 
          />
      </View>
    )
  }

  return (
    <GiftedChat messages={messages} user={user} onSend={handleSend} />
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    input: {
        height: 50,
        width: '100%',
        borderWidth: 1,
        padding: 15,
        marginBottom: 20,
        borderColor: 'gray',
    },
})
