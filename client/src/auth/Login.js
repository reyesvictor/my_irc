import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { authenticate, isAuth } from './helpers'

const Login = ({ history }) => {
  //state and state hook
  const [values, setValues] = useState({
    email: "antonio@bg.fr",
    password: "motdepasse",
    buttonText: "Submit"
  });

  const { email, password, buttonText } = values;

  const handleChange = login => event => {
    // console.log(event.target);
    setValues({ ...values, [login]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: 'Submitting...' })
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API}/login`,
      data: { email, password }
    })
      .then(response => {
        console.log('LOGIN SUCCESS', response)
        //save response and token => cookie and localstorage
        authenticate(response, () => {
          setValues({ ...values, email: '', password: '', buttonText: 'Submitted' })
          // toast.success(response.data.message)
          isAuth() && isAuth().type === true ? history.push('/admin') : history.push(`/${isAuth().login}`);
        })
      })
      .catch(error => {
        console.log('LOGIN ERROR', error.response.data)
        setValues({ ...values, buttonText: 'Submit' })
        toast.error(error.response.data.error)
      })
  };

  const loginForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Email</label>
        <input
          onChange={handleChange("email")}
          value={email}
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label className="text-muted">Password</label>
        <input
          onChange={handleChange("password")}
          value={password}
          type="text"
          className="form-control"
        />
      </div>
      <div>
        <button className="btn btn-primary" onClick={clickSubmit}>
          {buttonText}
        </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <ToastContainer />
      {/* {JSON.stringify({ login, email, password, confirmationPassword })} */}
      <div className="row">
        <div className="mx-auto col-6">
          {isAuth() ? <Redirect to='/' /> : null}
          <h1 className="p-5 text-center">Log In Page</h1>
          {/* {JSON.stringify(isAuth())} */}
          {loginForm()}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
