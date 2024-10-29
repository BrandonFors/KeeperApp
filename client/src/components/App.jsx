import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from "axios";
import "../../public/styles.css";
function App() {
  //state changes visible on next render
  const [notes, setNotes] = useState([]);
  
  const getNotes = async ()=>{
    const response = await axios.get("http://localhost:8080/notes");
    setNotes(response.data.notes);
  };
  //notes doesn't update immediately after setNotes is run(?) => we must use data input
  const postNotes = async (data)=>{
    const postData = {
      notes: data
    }
    console.log(postData)
    const response = await axios.post("http://localhost:8080/notes",postData);
  }

  useEffect(()=>{
    getNotes();
  },[])

  function addNote(note) {
    var newNoteList;
    setNotes((prevValue) => {
      newNoteList = [
        ...prevValue,
        {
          title: note.title,
          content: note.content,
        },
      ];
      return newNoteList;
    });
    postNotes(newNoteList);
  }
  function deleteNote(id) {
    var newNoteList;
    setNotes((prevValue) => {
      newNoteList =  prevValue.filter((note, index) => {
        return id !== index;
      });
      return newNoteList;
    })
    console.log(`delete: ${newNoteList}`)
    postNotes(newNoteList);
  }

  return (
    <div>
      <Header />
      <CreateArea addNote={addNote} />
      {notes.map((note, index) => {
        return (
          <Note
            key={index}
            id={index}
            title={note.title}
            content={note.content}
            deleteNote={deleteNote}
          />
        );
      })}

      <Footer />
    </div>
  );
}

export default App;