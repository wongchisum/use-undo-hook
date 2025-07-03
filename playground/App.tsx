import "./App.css";
import { useUndo } from "../src";

function App() {
  const [{ count, app, text }, setState, { canUndo, canRedo, undo, redo }] =
    useUndo({
      count: 0,
      app: { version: 1 },
      text: ["ok"],
    });

  const incrementCount = () => {
    setState((state) => state.count++);
  };

  const incrementVersion = () => {
    setState((state) => state.app.version++);
  };

  const incrementText = () => {
    setState((state) => state.text.push("ok"));
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <div className="actions">
          <button onClick={incrementCount}>Increment Count</button>
          <button onClick={incrementVersion}>Increment version</button>
          <button onClick={incrementText}>Increment text</button>
          <button disabled={!canUndo()} onClick={undo}>
            undo
          </button>
          <button disabled={!canRedo()} onClick={redo}>
            redo
          </button>
        </div>
        <p>Count is {count}</p>
        <p>APP version: {app.version}</p>
        <p>Text: {text.join(",")}</p>
      </div>
    </>
  );
}

export default App;
