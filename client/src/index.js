import React from "react";
import ReactDOM from "react-dom";
import Routes from "./Routes";

console.log = (msg) => { };
console.error = (msg) => { };

ReactDOM.render(<Routes />, document.getElementById("root"));
