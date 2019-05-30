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
app.get("/", (req, res) => {
    res.render("index");
});