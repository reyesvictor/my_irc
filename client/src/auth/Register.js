import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth } from "./helpers";

const Register = () => {
  //state and state hook
  const [values, setValues] = useState({
    login: "Antonio",
    email: "antonio@bg.fr",
    password: "motdepasse",
    confirmationPassword: "motdepasse",
    buttonText: "Submit",
  });

  const { login, email, password, confirmationPassword, buttonText } = values;

  const handleChange = login => event => {
    // console.log(event.target);
    setValues({ ...values, [login]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: 'Submitting...' })
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API}/register`,
      data: { login, email, password, confirmationPassword }
    })
      .then(response => {
        console.log('REGISTER SUCCESS', response)
        setValues({ ...values, login: '', email: '', password: '', confirmationPassword: '', buttonText: 'Submitted' })
        toast.success(response.data.message)
      })
      .catch(error => {
        console.log('REGISTER ERROR', error.response.data)
        setValues({ ...values, buttonText: 'Submit' })
        toast.error(error.response.data.error)
      })
  };

  const registerForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Login</label>
        <input
          onChange={handleChange("login")}
          value={login}
          type="text"
          className="form-control"
        />
      </div>
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
      <div className="form-group">
        <label className="text-muted">Confirm Password</label>
        <input
          onChange={handleChange("confirmationPassword")}
          value={confirmationPassword}
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
          {isAuth() ? <Redirect to="/"/> : null}
          <h1 className="p-5 text-center">Register Page</h1>
          {registerForm()}
        </div>
      </div>
    </Layout>
  );
};

export default Register;
