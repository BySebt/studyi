import React, { useEffect, useState } from "react";
import TodoItem from "./components/TodoItem";
import AddTodo from "./components/AddTodo";
import { Alert } from "@material-ui/lab";
import { getTodos, addTodo, updateTodo, deleteTodo } from "./API";
// import AppTheme from "./themes/AppTheme";

const App: React.FC = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = (): void => {
    getTodos()
      .then(({ data: { todos } }: ITodo[] | any) => setTodos(todos))
      .catch((err: Error) => console.log(err));
  };

  const handleSaveTodo = (e: React.FormEvent, formData: ITodo): void => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name || /^\s*$/.test(formData.name)) {
      setErrorMessage("Name can not be empty.");
      return;
    }

    if (!formData.description || /^\s*$/.test(formData.description)) {
      setErrorMessage("Description can not be empty.");
      return;
    }

    addTodo(formData)
      .then(({ status, data }) => {
        if (status !== 201) {
          throw new Error("Error! Todo not saved");
        }
        setTodos(data.todos);
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateTodo = (todo: ITodo): void => {
    updateTodo(todo)
      .then(({ status, data }) => {
        if (status !== 200) {
          throw new Error("Error! Todo not updated");
        }
        setTodos(data.todos);
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteTodo = (_id: string): void => {
    deleteTodo(_id)
      .then(({ status, data }) => {
        if (status !== 200) {
          throw new Error("Error! Todo not deleted");
        }
        setTodos(data.todos);
      })
      .catch((err) => console.log(err));
  };
  return (
    <main className="App">
      <h1>My Tasks</h1>

      <AddTodo saveTodo={handleSaveTodo} />

      <div id="alert">
        {errorMessage.length > 0 ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : (
          <Alert severity="success">Success!</Alert>
        )}
      </div>

      {todos.map((todo: ITodo) => (
        <TodoItem
          key={todo._id}
          updateTodo={handleUpdateTodo}
          deleteTodo={handleDeleteTodo}
          todo={todo}
        />
      ))}

      <footer>
        <p>Copyright © Edwin Li 2021</p>
      </footer>
    </main>
  );
};

export default App;
