import React, { Fragment } from "react";
import { Link, withRouter } from 'react-router-dom'
import { isAuth, logout } from "../auth/helpers";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const Layout = ({ children, match, history }) => {

  const [values, setValues] = React.useState({
    search: '',
  });
  const { search } = values;
  const handleChange = title => event => {
    setValues({ ...values, [title]: event.target.value });
  };

  const isActive = path => {
    // console.log(match.path);
    if (match.path === path) {
      return { cursor: 'pointer', color: '#000000' };
    } else {
      return { cursor: 'pointer', color: '#ffffff' };
    }
  }

  // const clickSearch = (event) => {
  //   console.log(event.target.value, search);
  //   event.preventDefault();
  //   axios({
  //     method: 'POST',
  //     url: process.env.REACT_APP_API + '/blog/search',
  //     data: { search }
  //   }).then(res => res.json())
  //     .then(response => {
  //       console.log(response.data);
  //       // toast.success(response.data.message);

  //       this.response = response.data
  //       // return this.response[0].billets
  //       this.props.history.push({
  //         pathname: "/search",
  //         data: this.response[0].billets // your data array of objects
  //       })
  //     })
  //     .catch(error => toast.error(error.response.data.error))
  // };


  const nav = () => (
    <ul className="nav nav-tabs bg-primary">
      <li className="nav-item">
        <Link to="/" className="nav-link" style={isActive('/')}>Home</Link>
        {/* {JSON.stringify(match)} */}
      </li>
      {/* //if not loggedin, then (&&) */}
      {/* {!isAuth() && */}

      {isAuth() && isAuth().type === true && (
        <li className="nav-item">
          <Link to="/admin" className="nav-link" style={isActive('/admin')}>ADMINS-ONLY</Link>
        </li>
      )}

      {isAuth() ?
        <Fragment>
          <li className="nav-item">
            <Link to={'/' + isAuth().login} className="nav-link" style={isActive(isAuth().login)}>{isAuth().login}</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" style={isActive('/login')}
              onClick={() => {
                logout(() => {
                  history.push('/');
                });
              }}
            >Logout</Link>
          </li>
        </Fragment>
        :
        <Fragment>
          <li className="nav-item">
            <Link to="/login" className="nav-link" style={isActive('/login')}>Login</Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-link" style={isActive('/register')}>Register</Link>
          </li>
        </Fragment>
      }
      <>
        <form class="form-inline mr-auto">
          <div class="md-form my-0">
            <input class="form-control" type="text" placeholder="Search" aria-label="Search" onChange={handleChange("search")} />
            <i class="fas fa-search text-white ml-3" aria-hidden="true"></i>
            <Link to={{pathname: `/search/${search}`}} className="btn btn-light" >Search</Link>
          </div>
        </form>
      </>
    </ul>
  );
  return (
    <Fragment>
      {nav()}
      <div className="container">{children}</div>
    </Fragment>
  );
};



export default withRouter(Layout);
