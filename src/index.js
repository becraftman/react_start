import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {HelloWorld} from "./components/HelloWorld";

ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<HelloWorld/>, document.getElementById('ex1'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
