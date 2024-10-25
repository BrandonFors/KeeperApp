import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";
import "../../public/styles.css";

function CreateArea(props) {
  const [note, setNote] = useState({
    title: "",
    content: "",
  });
  const [titleClicked, setTitleClicked] = useState(false);


  function handleChange(event) {
    const { name, value } = event.target;
    setNote((prevValue) => {
      return {
        ...prevValue,
        [name]: value,
      };
    });
  }

  function handleClick(event){
    setTitleClicked(true);
  }
  return (
    <div>
      <form
        className = "create-note"
        onSubmit={(event) => {
          props.addNote(note);
          setNote({
            title: "",
            content: "",
          });
          event.preventDefault();
        }}
      >
        <input
          onChange={handleChange}
          onClick = {handleClick}
          name="title"
          placeholder="Title"
          value={note.title}
        />
        {
          titleClicked &&
          <textarea
          onChange={handleChange}
          name="content"
          placeholder="Take a note..."
          rows={titleClicked ? 3:1}
          value={note.content}
        />
        }
        
        <Zoom in = {titleClicked}>
          <Fab type="submit">
            <AddIcon />
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
