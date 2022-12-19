import React from "react";
import {Switch, Route, Link} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import CutOutCanvasV2 from "./Components/cutOutCanvasWithVertex.js";

function App() {
  return (
    <div className="App">
      <CutOutCanvasV2 />
    </div>
  );
}

export default App;
