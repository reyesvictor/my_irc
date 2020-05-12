import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './core/Home';
import Chat from './core/Chat';

const Routes = () => {
  return (
    // <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/chat' exact component={Chat} />
        </Switch>
      </BrowserRouter>
    // </Provider>
  );
};

export default Routes;
