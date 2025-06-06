import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Login from "./Login";
import axios from "axios";
import "../../public/styles.css";
function App() {
  //state declaration and initialization
  const [notes, setNotes] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState(null);

    //retrives notes list from the backend
  const getNotes = async ()=>{
    const response = await axios.get("http://localhost:8080/notes");
    setNotes(response.data.notes);
  };

  //useEffect that updates the displayed username based on if the backend thinks the user is logged in or not
  useEffect(()=>{
    //verifies that the backend still has the user logged in 
    const verifySession = async ()=>{
      try{
        const response = await axios.get("http://localhost:8080/check-session");
        return response.data.loggedIn;
      }catch(error){
        return false;
      }
    }
    //
    const checkUser = async () => {
      //gets the username from localstorage
      const storedUsername = localStorage.getItem("username");
      //if the there was a stored username in the first place
      if (storedUsername) {
        const isSessionValid = await verifySession(); 
        if (isSessionValid) {
          //set the username state to the stored username
          setUsername(storedUsername);
        } else {
          //remove the stored username from localstorage
          localStorage.removeItem("username");
        }
      }
    };
  
    checkUser();
    getNotes();
  },[])
  //if the login is presed, show the login pannel
  function handleLoginPressed(){
    setShowLogin(!showLogin);
  }
  //if the "x" is pressed on the login panel, don't show the login
  function exitLogin(){
    setShowLogin(false);
  };
  //if signout is pressed tell the backend the user is signing out and remove the username from local storage
  async function handleSignOutPressed(){
    const response = await axios.post("http://localhost:8080/signout");
    setUsername(null);
    localStorage.removeItem("username");
    //refresh notes from backend
    getNotes();
  }
  //if a login is triggered set username state to the input name and store the name in localstorage 
  async function handleLogin(username) {
    setUsername(username);
    localStorage.setItem("username", username);
    //refresh notes from backend
    getNotes();    
  }

  //add a note from the input
  async function addNote(note) {
    //create data to be shipped to backend
    const postData = {
      title: note.title,
      content: note.content,
    }
    //post data to backend as a new note
    const response = await axios.post("http://localhost:8080/new",postData);
    //use the assigned id by backend and input note details to create a new note copy locally
    const newNote = {
      id:response.data.id,
      title: note.title,
      content: note.content,
    }
    //add the new note to the notes list
    setNotes((prevValue) => {
      return [...prevValue,newNote];
    });
  }
  //delete a note
  async function deleteNote(id) {
    let newNoteList;
    //create post data with the deleted note's id
    const postData = {
      id:id 
    }
    //tell the backend to delete the note
    const response = await axios.post("http://localhost:8080/delete",postData);

    //update the notes list with a new list not containing the deleted note
    setNotes((prevValue) => {
      //filter out the note based on the id
      newNoteList =  prevValue.filter((note, index) => {
        return id !== note.id;
      });
      
      return newNoteList;
    })
    
  }
  //edit note elements
  async function editNote(id, title, content) {
    //create post data using new editted elements and the id
    const postData = {
      id:id,
      title:title,
      content:content
    }
    //update the note in the backend
    const response = await axios.post("http://localhost:8080/update",postData);
    //update the note in the list according to id, keeping all other notes the same
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
    {/* Header bar */}
      <Header username = {username} handlePress = {username ? handleSignOutPressed : handleLoginPressed}/>
      {showLogin && <Login exitLogin = {exitLogin} handleLogin = {handleLogin}/>}
      {/* Area where users can create new notes */}
      <CreateArea addNote={addNote} showLogin = {showLogin}/>
      {/* Displays all notes in the notes state */}
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