import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import "../../public/styles.css";



function Note(props) {
  const [title, setTitle] = useState(props.title);
  const [content, setContent] = useState(props.content);
  const [editing, setEditing ] = useState(false);

  const handleSubmit = ()=>{
    props.editNote(props.id, title, content);
  }

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
