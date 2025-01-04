const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pg = require("pg");
// const corsOptions = {
//     origin: "http://localhost:5173/",
// }

const app = express();
const port = 8080;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())
// app.use(cors(corsOptions))


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "keeperapp",
    password: "klikmeNow",
    port: 5432,
});

db.connect();


app.get("/notes", async (req,res)=>{
    const result = await db.query("SELECT * FROM notes");
    notesArray = result.rows;
    res.json({
        notes: notesArray
    });
})

app.post("/new", async (req,res)=>{
    const {title, content} = req.body;
    const result = await db.query("INSERT INTO notes (title, content) VALUES($1,$2) RETURNING id", 
        [title, content]
    );
    const newId = result.rows[0].id;
    const data = {
        id:newId
    }
    res.json(data);
})

app.post("/update", async (req,res)=>{
    const {id,title,content} = req.body;
    const result = await db.query("UPDATE notes SET title = $1, content = $2 WHERE id = $3",
        [title,content,id]
        );
    res.send("Note Updated");
})
app.post("/delete",async (req,res)=>{
    const {id} = req.body;
    const result = await db.query("DELETE FROM notes WHERE id = $1",
        [id]
        );
    res.send("Note Updated");
})


app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})