import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";
import "../../public/styles.css";
// Provides area for user to create new notes
function CreateArea(props) {
  //creates a note state that stores a dictionary with the text input components
  const [note, setNote] = useState({
    title: "",
    content: "",
  });
  //handles if the user clicks on the title input
  const [titleClicked, setTitleClicked] = useState(false);

  //handles any edits to the create area  
  function handleChange(event) {
    const { name, value } = event.target;
    setNote((prevValue) => {
      return {
        ...prevValue,
        [name]: value,
      };
    });
  }
  //handles a text box click which triggers a drop down of a textbox
  function handleClick(event){
    setTitleClicked(true);
  }
  return (
    <div>
      <form
        className = "create-note"
        // on submit, add the note to the board and reset the creation space
        onSubmit={(event) => {
          props.addNote(note);
          setNote({
            title: "",
            content: "",
          });
          setTitleClicked(false);
          event.preventDefault();
        }}
      >
        {/* title input */}
        <input
          onChange={handleChange}
          onClick = {handleClick}
          name="title"
          placeholder="Title"
          value={note.title}
        />
        {/* If the title is clicked, reveal the content text area */}
        {
          titleClicked &&
          // body input for the note
          <textarea
          onChange={handleChange}
          name="content"
          placeholder="Take a note..."
          rows={titleClicked ? 3:1}
          value={note.content}
        />
        }
        {/* submit button to create the note */}
        <Zoom in = {titleClicked}>
          <Fab type="submit" disabled = {props.showLogin}>
            <AddIcon />
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
