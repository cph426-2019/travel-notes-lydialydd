import * as express from "express";
import {DB, Rows, InsertResult} from "./db";
import * as bcrypt from "bcrypt";
import * as cookieParser from "cookie-parser";

let path = (req: express.Request): string => {
    return `${req.baseUrl}${req.path}`;
};

let router = express.Router();

// cookie parser will read and write secure cookies
// that are protected by our cookie secret
router.use(cookieParser(process.env.COOKIE_SECRET));

router.get("/", (req, res) => {
    res.render("admin/index", {
        layout: "admin"
    });
});

// Login form
router.get("/login", (req, res) => {
    res.render("admin/login", {
        layout: "admin",
        message: req.query.message
    });
});
// test password validity
router.post("/login", async (req, res) => {
    let isValid = await bcrypt.compare(req.body.password, process.env.ADMIN_PASSWORD_HASH);
    if (isValid) {
        res.cookie("authenticated", "true", {
            signed: true // by using the signed option, our cookie is secure
        });
        res.redirect(`${req.baseUrl}`); // redirect to admin home page
    } else {
        res.redirect(`${req.baseUrl}/login?message=Password Incorrect`);
    }
});

// logout
router.get("/logout", (req, res) => {
    res.clearCookie("authenticated");
    res.redirect(`${req.baseUrl}/login`);
});

// middleware to authenticate the user 
// to make sure they login before going to any other admmin pages
router.use((req, res, next) => {
    if(req.signedCookies.authenticated) {
        next();
    } else {
        return res.redirect(`${req.baseUrl}/login`);
    }
});

// listing all todos
router.get("/todos", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM todos");
    res.render("admin/todos/index", {
        todos: rows,
        layout: "admin"
    });
});

// defining this route above todos/:id to ensure it gets tested by the router logic 1st
router.get("/todos/new", (req, res) => {
    res.render("admin/todos/editor", {
        action: `${req.baseUrl}/todos`,
        layout: "admin",
        todo: {
            description: "",
            url: "",
        },
    });
});

// the route  for creating a new todo is just '/todos' bc the HTTP spec
// says when u create a new resource, it should be subordinate 
// to the URL u posted your data to
router.post("/todos", async (req, res) => {
    try {
        // use mySQL workbench to generate this sql w specific vals
        //replace specific vals w placeholders prefixed by :
        let sql = `INSERT INTO todos
                    (description, url)
                    VALUES
                    (:description, :url)`;
        let params = {
            description: req.body.description,
            url: req.body.url
        };
        if( req.body.description === "") {
            res.redirect(path(req) + "/new?message=Invalid Description");
            return;
        }
        // creating a new record in the DB is special bc we 
        // need to know the id that the DB assigned to our new record
        let [result] = await DB.execute<InsertResult>(sql, params);
        res.redirect(`${path(req)}/${result.insertId}?message=Saved!`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}?message=Error Saving`);
    }
});

// view the editor of an existing todo
router.get("/todos/:id", async (req, res) => {
    let sql = "SELECT * FROM todos WHERE id=:id";
    let params = { id: req.params.id };
    try {
        let [rows] = await DB.query<Rows>(sql, params);
        if (rows.length === 1) {
            res.render("admin/todos/editor", {
                todo: rows[0],
                action: path(req),
                layout: "admin",
                message: req.query.message
            });
        } else {
            res.redirect(`${path(req)}/../`);
        }
    } catch (e) {
        console.error(e);
        res.redirect(`${path(req)}/../`);
    }
});

router.post("/todos/:id", async (req, res) => {
    try {
        // use mySQL workbench to generate this sql w specific vals
        //replace specific vals w placeholders prefixed by :
        let sql = `UPDATE todos     
                   SET description=:description, 
                       url=:url 
                   WHERE id=:id`;
        let params = {
            id: req.params.id,
            description: req.body.description,
            url: req.body.url
        };
        await DB.execute<Rows>(sql, params);
        res.redirect(`${path(req)}?message=Saved!`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}?message=Error Saving`);
    }
});

// add delete support 
router.post("/todos/:id/delete", async (req, res) => {
    let sql = "DELETE FROM todos WHERE id=:id";
    let params = {
        id:req.params.id
    };
    try {
        await DB.execute<Rows>(sql, params);
        res.redirect(`${path(req)}/../../`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}/../../`);
    }
});

// listing all posts
router.get("/posts", async (req, res) => {
    let [rows] = await DB.query<Rows>("SELECT * FROM posts ORDER BY publishAt DESC");
    res.render("admin/posts/index", {
        posts: rows,
        layout: "admin"
    });
});

// defining this route above posts/:id to ensure it gets tested by the router logic 1st
router.get("/posts/new", (req, res) => {
    res.render("admin/posts/editor", {
        action: `${req.baseUrl}/posts`,
        layout: "admin",
        post: {
            title: "",
            body: "",
            publishAt: ""
        },
    });
});

// the route  for creating a new post is just '/posts' bc the HTTP spec
// says when u create a new resource, it should be subordinate 
// to the URL u posted your data to
router.post("/posts", async (req, res) => {
    try {
        // use mySQL workbench to generate this sql w specific vals
        //replace specific vals w placeholders prefixed by :
        let sql = `INSERT INTO posts
                    (title, body, publishAt)
                    VALUES
                    (:title, :body, :publishAt)`;
        let params = {
            title: req.body.title,
            body: req.body.body,
            publishAt: req.body.publishAt
        };
        if( req.body.title === "") {
            res.redirect(path(req) + "/new?message=Invalid Description");
            return;
        }
        // creating a new record in the DB is special bc we 
        // need to know the id that the DB assigned to our new record
        let [result] = await DB.execute<InsertResult>(sql, params);
        res.redirect(`${path(req)}/${result.insertId}?message=Saved!`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}?message=Error Saving`);
    }
});


// view the editor of an existing todo
router.get("/posts/:id", async (req, res) => {
    let sql = "SELECT * FROM posts WHERE id=:id";
    let params = { id: req.params.id };
    try {
        let [rows] = await DB.query<Rows>(sql, params);
        if (rows.length === 1) {
            res.render("admin/posts/editor", {
                post: rows[0],
                action: path(req),
                layout: "admin",
                message: req.query.message
            });
        } else {
            res.redirect(`${path(req)}/../`);
        }
    } catch (e) {
        console.error(e);
        res.redirect(`${path(req)}/../`);
    }
});

router.post("/posts/:id", async (req, res) => {
    try {
        // use mySQL workbench to generate this sql w specific vals
        //replace specific vals w placeholders prefixed by :
        let sql = `UPDATE posts     
                   SET title=:title, 
                       body=:body,
                       publishAt=:publishAt 
                   WHERE id=:id`;
        let params = {
            id: req.params.id,
            title: req.body.title,
            body: req.body.body,
            publishAt: req.body.publishAt
        };
        await DB.execute<Rows>(sql, params);
        res.redirect(`${path(req)}?message=Saved!`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}?message=Error Saving`);
    }
});

// add delete support 
router.post("/posts/:id/delete", async (req, res) => {
    let sql = "DELETE FROM posts WHERE id=:id";
    let params = {
        id:req.params.id
    };
    try {
        await DB.execute<Rows>(sql, params);
        res.redirect(`${path(req)}/../../`);
    } catch(e) {
        console.error(e);
        res.redirect(`${path(req)}/../../`);
    }
});

export default router;