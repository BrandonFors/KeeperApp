const express =require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const corsOptions = {
//     origin: "http://localhost:5173/",
// }

const app = express();
const port = 8080;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())
// app.use(cors(corsOptions))


var notesArray = [];

app.get("/notes", (req,res)=>{
    res.json({
        notes: notesArray
    });
})

app.post("/notes",(req,res)=>{
    const {notes} = req.body;
    console.log(notes);
    notesArray = notes;
    res.send("Notes Logged");
})


app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})