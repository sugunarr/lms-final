import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './index.css';
// import App from './App.js';
import  Dashboard  from "./components/dashboard/dashboard";
import  ApplyLeave  from "./components/dashboard/requestLeave";
import { Login } from "./components/login/login";
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Store } from "./models/store";
import { Provider } from "mobx-react"

const routing = (
    <Provider Store={Store}>
    <Router>
      <div>
        <Route exact path="/" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/apply" component={ApplyLeave} />
      </div>
    </Router>
    </Provider>
  )

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
