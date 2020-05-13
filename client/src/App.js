import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './core/Home';
import Chat from './core/Chat';

const App = () => (
    // <Provider store={store}>
      <Router>
        {/* <Switch> */}
          <Route path='/' exact component={Home} />
          <Route path='/chat' component={Chat} />
        {/* </Switch> */}
      </Router>
    // </Provider>
);

export default App;
