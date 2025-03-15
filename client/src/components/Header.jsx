import React, { useEffect, useState } from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import "../../public/styles.css";

function Header(props) {
  const [username, setUsername] = useState(null);

  useEffect(()=>{
    setUsername(props.username);
  },[props.username])

  return (
    <header>
      <h1><HighlightIcon/> Keeper</h1>
      <button onClick={() => props.handlePress()}> {username ? `Sign Out: ${username}`: `Log In`}</button>
    </header>
  );
}

export default Header;