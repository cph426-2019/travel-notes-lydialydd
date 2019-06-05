import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import * as exphbs from "express-handlebars";
import { DB, Rows } from "./db";
import admin from "./admin";

let app = express();
app.use(express.static("dist/"));
app.use(express.urlencoded({extended:true}));

app.set("view engine", "hbs");
app.set("views", "server/views");
app.engine("hbs", exphbs({
    defaultLayout: "default",
    extname: "hbs",
}));
app.get("/", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM posts ORDER BY publishAt DESC");
    res.render("index", {todos: rows, title: "Blog Posts"});
});

app.get("/index", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM posts ORDER BY publishAt DESC");
    res.render("index", {posts: rows, title: "Blog Posts"});
});

// app.get("/todos.json", async (req, res) => {
//     let [rows, fields] = await DB.query<Rows>("SELECT * FROM todos");
//     res.json(rows);
// });

app.get("/bucket-list", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM todos");
    res.render("bucket-list", {todos: rows, title: "Bucket List"});
});


// how you can click on diff blog posts in diff pages when added to database
app.get("/bucket-list/:id", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM todos WHERE id = :id", {id: req.params.id});
    res.json(rows);
});


app.get("/gallery", (req, res) => {
    res.render("gallery", {title: "Photos"});
});

// app.get("/bucket-list", (req, res) => {
//     res.render("bucket-list", {title: "Bucket List"});
// });

app.get("/about-me", (req, res) => {
    res.render("about-me", {title: "About Lyd"});
});

app.use("/admin", admin);

export let main = async () => {
    app.listen(process.env.PORT, () => console.log(`Listening on ${process.env.PORT}`))
   .on("error", (e) => console.error(e));
};

main(); 
