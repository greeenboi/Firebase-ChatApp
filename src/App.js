import React, { useRef, useState } from 'react';
import './App.css';
import icon from './icon.svg'


import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBQVd76CBkSSS0imyeSzxf91boJZPECix0",
  authDomain: "private-chat-c2a20.firebaseapp.com",
  projectId: "private-chat-c2a20",
  storageBucket: "private-chat-c2a20.appspot.com",
  messagingSenderId: "843151444230",
  appId: "1:843151444230:web:1f423f4851bb8953393687",
  measurementId: "G-2N94MEW4F6"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header align="center">        
       {user ? <SignOut /> : <SignIn />}
       <img className='logo' src={icon} alt="logo"/>
      </header>
      <section>
        {user ? <ChatRoom /> : <div className='text-login'>Please Login</div>}
      </section>
    </div>
  );
}



function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });
    
    auth.signInWithRedirect(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign In With Google</button>
  )
}

function SignOut(){
  return auth.currentUser &&(
    <button onClick={() => auth.signOut()}><img className="exit" src="https://img.icons8.com/ios/100/exit--v1.png" alt="logout"/></button>

  )
}

function ChatRoom(){

  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(100);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behaviour: 'smooth'});
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

        <div ref={dummy}></div>

      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value) } placeholder="Type your message...."/>
        <button type="submit"><i class="fas fa-location-arrow"></i></button>

      </form>
    </>
  )
}



function ChatMessage(props){
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved'; 
  return( 
  <div className={`message ${messageClass}`}>
    <img className='image' src={photoURL || 'https://img.icons8.com/nolan/96/user.png'} alt="profile-pic"/>
    <p >{text}</p>   
  </div>
  )
}

export default App;
