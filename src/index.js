import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import App from './components/app'
import rootReducer from './reducers/index';
import thunk from 'redux-thunk';
import {establishConnection} from "./actions";
require('openlayers/css/ol.css')


const store = createStore(rootReducer, applyMiddleware(thunk))

store.dispatch(establishConnection())

const app = (
    <Provider store={store}>
      <App />
    </Provider>
)

ReactDOM.render(app, document.getElementById('root'))

