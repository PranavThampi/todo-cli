const { Command } = require("commander");
const program = new Command();
const fs = require("fs");

// Read all todos from file
const fileName = "todos.json";
let todos = [];

// Read file synchronously
try {
  const data = fs.readFileSync(fileName, 'utf8');
  if (data.length === 0) {
    todos = [];
  } else {
    todos = JSON.parse(data);
  }

} catch (err) {
  if (err.code === 'ENOENT') {
    console.log("File not found. Creating a new one.");
    todos = [];
    saveTodos();
  } else if (err instanceof SyntaxError) {
    console.log("Error parsing JSON. Initializing with empty array.");
    todos = [];
  } else {
    console.log("Error reading file:", err.message);
    throw err;
  }
}


let counter = 0;

// Save todos to file
function saveTodos() {
  fs.writeFileSync(fileName, JSON.stringify(todos, null, 2), 'utf8');
  console.log("Todos saved successfully");
}

// Add todos
function addTodos(todo) {
  todos.push(todo);
  saveTodos();
  showTodos();
}

// Show todos
function showTodos() {
  if (todos.length === 0) {
    console.log("No todos found");
    return;
  }
  todos.forEach((todo) => {
    console.log(`id: ${todo.id}, title: ${todo.title}`);
  });
}

// Delete todo
function deleteTodo(id) {
  let deleteIdx = todos.indexOf(todos.find((task) => task.id === id));
  if (deleteIdx > -1) {
    todos.splice(deleteIdx, 1);
  }
  saveTodos();
  showTodos();
}

// Update todo
function updateTodo(id, todo) {
  todos.find((task) => task.id === id).title = todo;  
  saveTodos();
  showTodos();
}

program
  .name("Todos CLI")
  .description("A simple cli program to maintain a Todo list")
  .version("1.0.0");

// Update the counter after loading todos
program.hook('preAction', () => {
  counter = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
});  

// Add Command
program
  .command("add-todo")
  .description("Add todo to the todo list")
  .argument("<string>", "Todo task")
  .action((str, options) => {
    let newTask = {
      id: counter,
      title: str,
    };
    addTodos(newTask);
  });

// View Command
program
  .command("view-todo")
  .description("View all todos from list")
  .action((str, options) => {
    showTodos();
  });

// Delete Command
program
  .command("delete-todo")
  .description("Delete todo from list")
  .argument("<int>", "id of the todo")
  .action((str, options) => {
    deleteTodo(parseInt(str));
  });

// Update Command
program
  .command("update-todo")
  .description("Update todo in the list")
  .argument("<string>", "updated todo definition")
  .requiredOption("-i, --id <int>", "id of the todo to update")
  .action((str, options) => {
    updateTodo(parseInt(options.id), str);
  });

program.parse();
