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

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "keeperapp",
  password: "klikmeNow",
  port: 5432,
});

try {
  db.connect();
} catch (error) {
  console.error(" connecting to db:", error);
  process.exit(1);
}

app.get("/notes", async (req, res) => {
  let notesArray = [];
  if (userId) {
    const result = await db.query("SELECT * FROM notes WHERE user_id = $1", [
      userId,
    ]);
    notesArray = result.rows;
  }else{
    notesArray = notesList;
  }
  res.json({
    notes: notesArray,
  });
});

app.post("/new", async (req, res) => {
  const { title, content } = req.body;
  const data = {
    id: null,
  };
  if (userId) {
    const result = await db.query(
      "INSERT INTO notes (title,content,user_id) VALUES($1,$2,$3) RETURNING id",
      [title, content, userId]
    );
    const newId = result.rows[0].id;
    data.id = newId;
  } else {
    data.id = notesList.length;
    notesList.push({
      title: title,
      content: content,
    });
  }
  res.json(data);
});

app.post("/update", async (req, res) => {
  const { id, title, content } = req.body;
  if (userId) {
    const result = await db.query(
      "UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4",
      [title, content, id, userId]
    );
  }else{
    notesList[id] = {
      title: title,
      content: content,
    }
  }

  res.send("Note Updated");
});

app.post("/delete", async (req, res) => {
  const { id } = req.body;
  if(userId){
    try{
      const result = await db.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [id,userId]);
      res.send("Note Deleted");
    }catch(error){
      res.send("Error deleting note.");
    }
  }else{
    notesList.splice(id, 1);
    res.send("Note Deleted");
  }

});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const lowUsername = username.toLowerCase();
  let resData = {
    success: true,
    username: lowUsername,
    message: "User logged in.",
  };
  const result = await db.query("SELECT * FROM users WHERE username = $1", [
    lowUsername,
  ]);
  if (!result.rows[0]) {
    resData.success = false;
    resData.message = "Username not found.";
  } else {
    hashedPassword = result.rows[0].password;
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
      userId = result.rows[0].id;
      if (notesList.length > 0) {
        try {
          await Promise.all(
            notesList.map(async (item) => {
              await db.query(
                "INSERT INTO notes (title, content, user_id) VALUES($1, $2, $3) RETURNING id",
                [item.title, item.content, userId]
              );
            })
          );
          notesList = [];
        } catch (error) {
          resData.message = "Failed to save notes.";
        }
      }
    } else {
      resData.success = false;
      resData.message = "Incorrect password.";
    }
  }
  res.json(resData);
});

app.post("/signup", async (req, res) => {
  console.log("Signup");
  const { username, password } = req.body;
  const lowUsername = username.toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);
  let resData = {
    success: true,
    message: "User signed up.",
  };
  try {
    const result = await db.query(
      "INSERT INTO users (username, password) VALUES($1,$2) RETURNING id",
      [lowUsername, hashedPassword]
    );
  } catch (error) {
    resData.success = false;
    if (error.detail == `Key (username)=(${lowUsername}) already exists.`) {
      resData.message = "Username already taken.";
    } else {
      resData.message = "A server error has occured.";
    }
  }
  res.json(resData);
});

app.post("/signout", (req, res) => {
  userId = null;
  let resData = {
    success: true,
    message: "User has been logged out.",
  };
  res.json(resData);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
