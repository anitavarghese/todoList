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

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

//API1   Returns a list of all todos whose status is 'TO DO'
app.get(
  "/todos/?status=TO%20DO&priority=HIGH&status=IN%20PROGRESS&search_q=Play",
  async (request, response) => {
    let data = null;
    let getTodosQuery = "";
    const { search_q = "", priority, status } = request.query;

    switch (true) {
      case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
        break;
      case hasPriorityProperty(request.query):
        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
        break;
      case hasStatusProperty(request.query):
        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
        break;
      default:
        getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
    }

    data = await database.all(getTodosQuery);
    response.send(data);
  }
);

//API2  Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodoQuery = `
    select * from todo
    where id=${todoId}`;
  const todoList = await db.get(getSpecificTodoQuery);
  response.send(todoList);
  //console.log("data given");
});

//API# Create a todo in the todo table,
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoListQuery = `
        insert into todo
        (id,todo,priority,status)
        values
        ('${id}',
        '${todo}',
        '${priority}',
        '${status}')`;
  await db.run(addTodoListQuery);
  response.send("Todo Successfully Added");
  console.log(addTodoListQuery);
});

//API4 update Todos
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    select * from todo
    where id=${todoId}`;
  const previousTodo = await db.run(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    update todo set
    todo='${todo}',
    priority='${priority}',
    status='${status}'
    where id=${todoId}`;
  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});
//API5 Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    delete from todo
    where id=${todoId}`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
