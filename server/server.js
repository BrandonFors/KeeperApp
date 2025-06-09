const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pg = require("pg");
// const corsOptions = {
//     origin: "http://localhost:5173/",
// }

const app = express();
const port = 8080;

let userId = null;
//only used when userId is null
let notesList = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// app.use(cors(corsOptions))
// set up postgres client locally
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "keeperapp",
  password: "klikmeNow",
  port: 5432,
});

// attempt to connect to database
try {
  db.connect();
} catch (error) {
  console.error(" connecting to db:", error);
  process.exit(1);
}

// endpoint to get notes from the database
app.get("/notes", async (req, res) => {
  let notesArray = [];
  // if a login (userId) is present, use the user id to fetch notes from the database
  if (userId) {
    const result = await db.query("SELECT * FROM notes WHERE user_id = $1", [
      userId,
    ]);
    notesArray = result.rows;
    // otherwise use notes stored i notes list
  }else{
    notesArray = notesList;
  }
  // send back notes to the frontend
  res.json({
    notes: notesArray,
  });
});

// endpoint to create a new note
app.post("/new", async (req, res) => {
  //get submitted title and content from the request body 
  const { title, content } = req.body;
  //to store created id
  const data = {
    id: null,
  };
  //if the user is logged in, place thenew note into the database
  if (userId) {
    const result = await db.query(
      "INSERT INTO notes (title,content,user_id) VALUES($1,$2,$3) RETURNING id",
      [title, content, userId]
    );
    //grab the new id created by the database
    const newId = result.rows[0].id;
    //store the new id in the data 
    data.id = newId;
  //if there is no login use the notesList present in the server 
  } else {
    //make the new id the next available number in the notesList
    data.id = notesList.length;
    //add the note to the notesList list
    notesList.push({
      title: title,
      content: content,
    });
  }
  //return the new note id
  res.json(data);
});

//endpoint to update a note item 
app.post("/update", async (req, res) => {
  //get note details from the request body
  const { id, title, content } = req.body;
  //if the suer is logged in, modify the note in the database
  if (userId) {
    const result = await db.query(
      "UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4",
      [title, content, id, userId]
    );
  //otherwise, modify the note within the notesList
  }else{
    notesList[id] = {
      title: title,
      content: content,
    }
  }

  res.send("Note Updated");
});

//endpoint to delete a note
app.post("/delete", async (req, res) => {
  //get the id from the request body
  const { id } = req.body;
  //if the user is logged in, delete the note from the database
  if(userId){
    try{
      const result = await db.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [id,userId]);
      res.send("Note Deleted");
    }catch(error){
      res.send("Error deleting note.");
    }
  //otherwise splice it out of the server notes list
  }else{
    notesList.splice(id, 1);
    res.send("Note Deleted");
  }

});

//endpoint to login
app.post("/login", async (req, res) => {
  //get the username and password submitted in the request
  const { username, password } = req.body;
  //convert the username to lowercase
  const lowUsername = username.toLowerCase();
  //create a response object
  let resData = {
    success: true,
    username: lowUsername,
    message: "User logged in.",
  };
  //look for the username in the database
  const result = await db.query("SELECT * FROM users WHERE username = $1", [
    lowUsername,
  ]);
  //if the username is not found, edit the response data appropriately
  if (!result.rows[0]) {
    resData.success = false;
    resData.message = "Username not found.";

  //otherwise continue login process
  } else {
    //hash the password
    hashedPassword = result.rows[0].password;
    //compare the hashed password to the stored hashed password
    const match = await bcrypt.compare(password, hashedPassword);
    //if they match continue login process
    if (match) {
      //get the user id from the response from the database
      userId = result.rows[0].id;
      //if there are notes that are present at time of login (these notes have not been placed in the databae)...
      //place the notes in the database
      if (notesList.length > 0) {
        try {
          //wait until all notes are submited into the database to continue
          await Promise.all(
            notesList.map(async (item) => {
              await db.query(
                "INSERT INTO notes (title, content, user_id) VALUES($1, $2, $3)",
                [item.title, item.content, userId]
              );
            })
          );
          notesList = [];
        } catch (error) {
          resData.message = "Failed to save notes.";
        }
      }
    //if password did not match, edit response data as fail
    } else {
      resData.success = false;
      resData.message = "Incorrect password.";
    }
  }
  //send back response data
  res.json(resData);
});

//endpoint to signup 
app.post("/signup", async (req, res) => {
  //grab submitted username and password from the request
  const { username, password } = req.body;
  //get a lowercase version of the username
  const lowUsername = username.toLowerCase();
  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  //create response object
  let resData = {
    success: true,
    message: "User signed up.",
  };
  //try to insert username and password into the users database
  try {
    const result = await db.query(
      "INSERT INTO users (username, password) VALUES($1,$2) RETURNING id",
      [lowUsername, hashedPassword]
    );
  //if error occurs, log a failed attempt
  } catch (error) {
    resData.success = false;
    //account for username already taken scenario
    if (error.detail == `Key (username)=(${lowUsername}) already exists.`) {
      resData.message = "Username already taken.";
    } else {
      resData.message = "A server error has occured.";
    }
  }
  //send back response data
  res.json(resData);
});
//signout endpoint
app.post("/signout", (req, res) => {
  //gets rid of the userId from the server 
  userId = null;
  let resData = {
    success: true,
    message: "User has been logged out.",
  };
  //send back data
  res.json(resData);
});

//endpoint to check the server session for login
app.get("/check-session", (req, res) => {
  //if a userId is present, let the frontend know
  if (userId) {
    res.json({ loggedIn: true});

  //otherwise, say there is no id present
  } else {
    res.json({ loggedIn: false });
  }
});

//start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
