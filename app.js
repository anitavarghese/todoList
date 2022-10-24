const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at localhost");
    });
  } catch (e) {
    console.log(`Dberror:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//Returns a list of all todos whose status is 'TO DO'
app.get("/todos/?status=TO%20DO", async (request, response) => {
  const { search_q } = request.query;
  const getTodoListQuery = `
    select * from todo
    where status LIKE '%${search_q}%'`;
  const todoList = await db.all(getTodoListQuery);
  //response.send(todoList);
  console.log(getTodoListQuery);
});
