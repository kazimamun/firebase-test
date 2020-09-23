import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const [user,setUser] = useState({
    isSignedIn: false,
    isGoogleSignedIn: false,
    isGithubSignedIn : false,
    isFbSignedIn:false,
    name:'',
    email:'',
    password:'',
    photoURL:'',
    success: false,
    error:''
  });
  const [newUser, setNewUser] = useState(false);
  //google sign in
  const handleGoogleSignIn = ()=>{
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(result=> {
      const {displayName, email, photoURL} = result.user;
      const newUser = {
        isGoogleSignedIn: true,
        name: displayName,
        email: email,
        photoURL: photoURL
      };
      setUser(newUser);
    })
    .catch(error=> {
      console.log(error.message)
    });
  };
  //github sign in
  const handleGithubSignIn =()=>{
    const provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(res=>{
      const {displayName, email, photoURL} = res.user;
      const newUser = {
        isGithubSignedIn: true,
        name: displayName,
        email: email,
        photoURL: photoURL
      };
      setUser(newUser);
    })
    .catch(err=>{
      console.log(err.message)
    });
  };
  //facebook sign in
  const handleFbSignIn = ()=>{
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(res=>{
      const {displayName, email, photoURL} = res.user;
      const newUser = {
        isFbSignedIn: true,
        name: displayName,
        email: email,
        photoURL: photoURL
      };
      setUser(newUser);
    })
    .catch(err=>{
      console.log(err.message)
    });
  };

  //Manual Sign In System

  //form validation
  const handleBlur=(e)=>{
    let isFieldValid = true;
    if(e.target.name === 'email'){
        //regular expression
        isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    };
    if(e.target.name === 'password'){
        const isPasswordValid = e.target.value.length > 4;
        const passwordHasNumber = /\d{1}/.test(e.target.value);
        isFieldValid = isPasswordValid && passwordHasNumber;
    };
    if(isFieldValid){
        const newUser = {...user};
        newUser[e.target.name] = e.target.value;
        setUser(newUser);
    };
  };
  const handleManualSubmit= (e)=>{
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res=>{
          const newUserInfo = {...user};
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
      })
      .catch(err=>{
          const newUserInfo = {...user};
          newUserInfo.error = err.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
      });
    };
    if(!newUser && user.email && user.password){
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res=>{
            const newUserInfo = {...user};
            newUserInfo.error = '';
            newUserInfo.success = true;
            newUserInfo.isSignedIn= true;
            setUser(newUserInfo);
        })
        .catch(err=>{
            const newUserInfo = {...user};
            newUserInfo.error = err.message;
            newUserInfo.success = false;
            setUser(newUserInfo);
        });
    };
    e.preventDefault();
  };
  const updateUserName = name=>{
    const user = firebase.auth().currentUser;

    user.updateProfile({
    displayName: name
    }).then(function() {
    console.log(`${name} updated successfully.`)
    }).catch(function(error) {
    console.log(error)
    });
};
  //sign out
  const handleSignOut =()=>{
    firebase.auth().signOut()
    .then(()=>{
      const newUser = {
        isSignedIn : false
      }
      setUser(newUser);
    })
    .catch(err=>{
      console.log(err.message);
    });
  };
  return (
    <div className="App">
      <h2 style={{backgroundColor:'darkblue',padding:'5px',color:'white'}}>Auto Sign In Section</h2>
      <div className="autoSignIn">
        <div className="google">
          <h1>Google Sign In System</h1>
          {
            user.isGoogleSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : 
                          <button onClick={handleGoogleSignIn}>Sign In With Google</button>
          }
        </div>
        <div className="github">
          <h1>Github Sign In System</h1>
          {
            user.isGithubSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
                                    <button onClick={handleGithubSignIn}>sign in with github</button>
          }
        </div>
        <div className="facebook">
          <h1>Facebook Sign In System</h1>
          {
            user.isFbSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
                                    <button onClick={handleFbSignIn}>sign in with Facebook</button>
          }
        </div>
      </div>
      <div className="manual">
        <h2 style={{backgroundColor:'darkblue',padding:'5px',color:'white'}}>Manual Submition</h2>
        <input type="checkbox" onChange={()=> setNewUser(!newUser)} name="newUser" id=""/>
        <label htmlFor="newUser">New User Sign Up</label>
        <form onSubmit={handleManualSubmit}>
          {
            newUser && <input type="text" onBlur={handleBlur} placeholder='Your Name' required/>
          }
          <br/>
          <input type="text" name='email' onBlur={handleBlur} placeholder='Your Email' required/>
          <br/>
          <input type="password" name='password' onBlur={handleBlur} placeholder='Password' required/>
          <br/>
          <input type="submit" value={newUser?'Sign Up':"Sign In"}/>
        </form>
        {
          user.success ? <p style={{color:'green'}}>{user.email} successfully {newUser?'sign up':'Logged In'}</p> : <p style={{color:'red'}}>{user.error}</p>
        }
        {
          user.error && <p style={{color:'red'}}>{user.error}</p>
        }
      </div>
      {
        (user.isSignedIn || user.isGoogleSignedIn || user.isGithubSignedIn || user.isFbSignedIn) && <div className="result">
          <p>Name : {user.name}</p>
          <p>Email : {user.email}</p>
          <img src={user.photoURL} alt=""/>
        </div>
      }
    </div>
  );
}

export default App;