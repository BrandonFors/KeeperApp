import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Login from "./Login";
import axios from "axios";
import "../../public/styles.css";
function App() {
  //state changes visible on next render
  const [notes, setNotes] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState(null);

  const getNotes = async ()=>{
    const response = await axios.get("http://localhost:8080/notes");
    setNotes(response.data.notes);
  };

  useEffect(()=>{
    const verifySession = async ()=>{
      try{
        const response = await axios.get("http://localhost:8080/check-session");
        return response.data.loggedIn;
      }catch(error){
        return false;
      }
    }
    const checkUser = async () => {
      const storedUsername = localStorage.getItem("username");
  
      if (storedUsername) {
        const isSessionValid = await verifySession(); 
        if (isSessionValid) {
          setUsername(storedUsername);
        } else {
          localStorage.removeItem("username");
        }
      }
    };
  
    checkUser();
  },[])

  function handleLoginPressed(){
    setShowLogin(!showLogin);
  }
  function exitLogin(){
    setShowLogin(false);
  };
  async function handleSignOutPressed(){
    const response = await axios.post("http://localhost:8080/signout");
    setUsername(null);
    localStorage.removeItem("username");
    getNotes();
  }
  async function handleLogin(username) {
    setUsername(username);
    localStorage.setItem("username", username);
    getNotes();
    console.log(username);
    
  }

  async function addNote(note) {

    const postData = {
      title: note.title,
      content: note.content,
    }
    const response = await axios.post("http://localhost:8080/new",postData);
    const newNote = {
      id:response.data.id,
      title: note.title,
      content: note.content,
    }
    setNotes((prevValue) => {
      return [...prevValue,newNote];
    });
  }

  async function deleteNote(id) {
    var newNoteList;
    const postData = {
      id:id 
    }
    const response = await axios.post("http://localhost:8080/delete",postData);

    setNotes((prevValue) => {
      newNoteList =  prevValue.filter((note, index) => {
        return id !== note.id;
      });
      
      return newNoteList;
    })
    
  }
 
  async function editNote(id, title, content) {
    const postData = {
      id:id,
      title:title,
      content:content
    }
    const response = await axios.post("http://localhost:8080/update",postData);
    setNotes((prevValue) => {
      const newNoteList = prevValue.map((note, index) => {
        if (note.id === id) {
          return {
            id:id,
            title: title,
            content: content,
          };
        }
        return note; 
      });
      return newNoteList; 
    });
  }

  return (
    <div>
      <Header username = {username} handlePress = {username ? handleSignOutPressed : handleLoginPressed}/>
      {showLogin && <Login exitLogin = {exitLogin} handleLogin = {handleLogin}/>}
      <CreateArea addNote={addNote} showLogin = {showLogin}/>
      {notes.map((note, index) => {
        return (
          <Note
            key={index}
            id={note.id}
            title={note.title}
            content={note.content}
            deleteNote={deleteNote}
            editNote = {editNote}
          />
        );
      })}

      <Footer />
    </div>
  );
}

export default App;