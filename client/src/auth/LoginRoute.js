import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { isAuth } from './helpers'
import {withRouter} from 'react-router'


const LoginRoute = ({ match , component: Component, ...rest}) => (
  <Route {...rest} render={
    props => isAuth()._id === match.params.user_id ? <Component {...props} /> : <Redirect to={{
      pathname: '/login',
      state: { from: props.location }
    }} />
  }>
  </Route>
)

export default withRouter(LoginRoute);