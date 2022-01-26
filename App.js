// @refresh state
import React,{useState,useEffect,useCallback,useRef} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,TextInput,Button,LogBox } from 'react-native';
import * as firebase from 'firebase/app';
import { getDatabase, push, ref, onValue, onChildAdded, get, child } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftedChat } from 'react-native-gifted-chat'

LogBox.ignoreLogs(['Setting a timer for a long period of time']);

const firebaseConfig = {
  apiKey: "AIzaSyDoo5lAZoXqqgLOkkfjE_0bzmM-GqMN_ms",
  authDomain: "chatapp-7d527.firebaseapp.com",
  projectId: "chatapp-7d527",
  storageBucket: "chatapp-7d527.appspot.com",
  messagingSenderId: "271932805404",
  appId: "1:271932805404:web:80cccfc5344a7036fc2ad9"
};

const app = firebase.initializeApp(firebaseConfig);
const db = getDatabase();


export default function App() {
  const [user,setUser] = useState(null);
  const [name,setName] = useState('');
  const [messages,setMessages] = useState([]);
  const lastMessageDate = useRef(null);

  var response = {};
  useEffect(()=>{
    //console.log('entered to the useEffect');
    var allMessages = [];
    readUser();
    const starCountRef = ref(db, 'chat/');
    const fetchData = async () =>{
      console.log('entered into the fetchdata');
      const response = await fetch('https://chatapp-7d527-default-rtdb.firebaseio.com/chat.json');
      if(response.ok){
        console.log('inside response.ok');
        const data = await response.json();
        //console.log('data', data);
        if(data)
        {
            for(let key in data){
              data[key] = {...data[key],createdAt: new Date(data[key].createdAt)}
              allMessages.push(data[key]);
            }
            allMessages.sort((a,b) => b.createdAt - a.createdAt);
            //console.log(allMessages[0]);
            lastMessageDate.current = new Date(allMessages[0].createdAt);
            setMessages(allMessages);
            allMessages = [];
            //console.log('resData , length', data, length.current);
        }
        else{
            console.log('snapshot does not exists');
            //length.current = 1;
        }
      }
      else{
        console.log('Facing error during data fetching');
      }
    }
    fetchData();
  
    // get(child(ref(db),'chat')).then((snapshot) => {
    //   if(snapshot.exists()){
    //     const data = snapshot.val();
    //     const allMessages = [];
    //     for(let key in data){
    //       data[key] = {...data[key],createdAt: new Date(data[key].createdAt)}
    //       allMessages.push(data[key]);
    //     }
    //     allMessages.sort((a,b) => b.createdAt - a.createdAt);
    //     //console.log(allMessages);
    //     length.current = allMessages.length;
    //     setMessages(allMessages);
    //   }
    //   else{
    //     console.log('snapshot does not exists');
    //     length.current = 1;
    //   }
    // }).catch((err) =>{console.log(err)})

     const unsubscribe = onChildAdded(starCountRef, (snapshot) => {
        const data = snapshot.val();
        //console.log('length from single messge',lastMessageDate.current);
        const dataDate = new Date( data.createdAt );
          if( (lastMessageDate.current < dataDate) || lastMessageDate.current === null ){
              //console.log('inside second if of single message');
              //console.log('single message',data);
              lastMessageDate.current = dataDate;
              appendMessages(data);
          }
        
        }
    )

  return () => unsubscribe();

   
  },[]);

  const appendMessages = useCallback(

    (message) => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, message))
    },
    []
  )

  const readUser = async () =>{
    const userInfo = await AsyncStorage.getItem('user');
    if(userInfo){
      setUser({
        ...JSON.parse(userInfo)}
        )
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
      let sentMessage = {...message[0], createdAt: message[0].createdAt.toISOString() }
      await push(ref(db, 'chat/'),
        sentMessage,
      );

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
          title="Enter to the chat" 
          />
      </View>
    )
  }

  return (
    <GiftedChat 
    messages={messages} 
    user={user} 
    onSend={handleSend} 
    showUserAvatar={true}
    />
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
