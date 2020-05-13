import React, { Fragment } from "react"
import { Link, withRouter } from 'react-router-dom'
import "react-toastify/dist/ReactToastify.min.css"

const Layout = ({ children, match }) => {
  const isActive = path => {
    if (match.path === path) {
      return { cursor: 'pointer', color: '#000000' }
    } else {
      return { cursor: 'pointer', color: '#ffffff' }
    }
  }

  const nav = () => (
    <ul className="nav nav-tabs bg-primary">
      <li className="nav-item">
        <Link to="/" className="nav-link" style={isActive('/')}>Home</Link>
        </li>
        <li className="nav-item">
        <Link to="/chat" className="nav-link" style={isActive('/chat')}>Chat</Link>
      </li>
    </ul>
  )


  return (
    <Fragment>
      {nav()}
      <div className="container">{children}</div>
    </Fragment>
  )
}



export default withRouter(Layout)
