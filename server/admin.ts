import * as express from "express";
import {DB, Rows, InsertResult} from "./db";

let path = (req: express.Request): string => {
    return `${req.baseUrl}${req.path}`;
};

let router = express.Router();

router.get("/", (req, res) => {
    res.render("admin/index", {
        layout: "admin"
    });
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

export default router;