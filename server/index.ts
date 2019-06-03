import * as express from "express";
import * as exphbs from "express-handlebars";
import * as dotenv from "dotenv";
dotenv.config();


let app = express();
app.use(express.static("dist/"));


app.set("view engine", "hbs");
app.set("views", "server/views");
app.engine("hbs", exphbs({
    defaultLayout: "default",
    extname: "hbs",
}));
app.get("/", (req, res) => {
    res.render("index", {title: "Home"});
});

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

export let main = async () => {
    app.listen(process.env.PORT, () => console.log(`Listening on ${process.env.PORT}`))
   .on("error", (e) => console.error(e));
};

main(); 
