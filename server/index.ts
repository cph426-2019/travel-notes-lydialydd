import * as express from "express";
import * as exphbs from "express-handlebars";
let app = express();
app.use(express.static("dist/"));
app.listen(1234, () => console.log("Listening on 1234"))
   .on("error", (e) => console.error(e));


app.set("view engine", "hbs");
app.set("views", "server/views");
app.engine("hbs", exphbs({
    defaultLayout: "default",
    extname: "hbs",
}));
app.get("/index", (req, res) => {
    res.render("index", {title: "Home"});
});

app.get("/gallery", (req, res) => {
    res.render("gallery", {title: "Photos"});
});

app.get("/bucket-list", (req, res) => {
    res.render("bucket-list", {title: "Bucket List"});
});

app.get("/about-me", (req, res) => {
    res.render("about-me", {title: "About Lyd"});
});