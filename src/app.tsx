import "./app.css";
import { Header } from "./components/header";

import { Renderer } from "./components/renderer";
import { useKeyEvent } from "./hooks/use-key-event";

function App() {
  useKeyEvent();

  return (
    <main className="container dark">
      {/* <Header /> */}
      <Renderer />
    </main>
  );
}

export default App;
