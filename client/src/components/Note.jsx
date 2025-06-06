import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import "../../public/styles.css";


// note element
function Note(props) {
  // note contents
  const [title, setTitle] = useState(props.title);
  const [content, setContent] = useState(props.content);
  // editing status of the note
  const [editing, setEditing ] = useState(false);

  // handles confirm button press when editing a note
  const handleSubmit = ()=>{
    props.editNote(props.id, title, content);
  }

  //sets up the note element on load
  useEffect(()=>{
    setTitle(props.title);
    setContent(props.content);
  },[props.title, props.content])

  return (
    <div className="note">
      {editing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="note-input"
            placeholder="Title"
          />
          <textarea
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="note-textarea"
            placeholder="Content"
          />
        </>
      ) : (
        <>
          <h1>{title}</h1>
          <p>{content}</p>
        </>
      )}
      
      <button
        onClick={() => {
          props.deleteNote(props.id);
        }}
      >
        <DeleteIcon />
      </button>
      <button
      onClick={() => {
        if(!editing){
          setEditing(true);
        }else{
          handleSubmit();
          setEditing(false);
        }
      }}>
        {editing ? <CheckIcon/>:<EditIcon/> }
      </button>
    </div>
  );
}

export default Note;
