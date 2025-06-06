import React, { useEffect, useState } from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import "../../public/styles.css";
// top bar for the website which displays title and sign in functionality
function Header(props) {
  const [username, setUsername] = useState(null);

// set the username from props
  useEffect(()=>{
    setUsername(props.username);
  },[props.username])

  return (
    <header>
      {/* website tile */}
      <h1><HighlightIcon/> Keeper</h1>
      {/* displays a sign out or login button based on iff a username is present */}
      <button onClick={() => props.handlePress()}> {username ? `Sign Out: ${username}`: `Log In`}</button>
    </header>
  );
}

export default Header;