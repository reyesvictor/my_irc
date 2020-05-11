import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Layout from "./Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth } from "../auth/helpers";


const Blog = ({ match, location }) => {
  //state and state hook
  const [values, setValues] = useState({
    title: "Some Original Title",
    content: "Some interesting content....",
    user_id: isAuth()._id,
    login: match.params.login,
    buttonText: "Submit"
  });

  const { title, content, password, user_id, login, buttonText } = values;

  const handleChange = title => event => {
    // console.log(event.target);
    setValues({ ...values, [title]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: 'Submitting...' })
    axios({
      method: 'POST',
      url: `${process.env.REACT_APP_API}/blog/billetCreate`,
      data: { title, content, user_id }
    })
      .then(response => {
        console.log('REGISTER SUCCESS', response)
        setValues({ ...values, title: '', content: '', buttonText: 'Submitted' })
        toast.success(response.data.message)
      })
      .catch(error => {
        console.log('REGISTER ERROR', error.response.data)
        setValues({ ...values, buttonText: 'Submit' })
        toast.error(error.response.data.error)
      })
  };

  return axios({
    method: 'POST',
    url: `${process.env.REACT_APP_API}/blog/billetRead/`,
    data: { login }
  })
    .then(response => {
      const billets = response.data.billets;

      billets.map((billets, i) => {
        console.log("Entered", billets, i);
        // Return the element. Also pass key     
        // return (<p>{billets.title}</p>);
      })

      // let posts = ['test']
      // console.log(posts)

      // const getBillets = async (login) => {
      //   return await axios({
      //     method: 'POST',
      //     url: `${process.env.REACT_APP_API}/blog/billetRead/`,
      //     data: { login }
      //   })
      //   .then(response => {
      //     // posts = response.data.billets,
      //     console.log(posts)
      //   })
      //   .catch(error => {
      //     console.log(`====ERROR===== GETTING BILLETS OF ${match.params.login}`, error.response.data)
      //     toast.error(error.response.data.error)
      //   })
      // }

      // const searchUser = async (login) => { return await User.findOne({ login }).then(user => user._id) };
      // const id = await searchUser(login);

      // const billets = new Promise((resolve, reject) => {
      //   // console.log('===billets1===', getBillets(login));
      //   console.log(posts)
      //   resolve(getBillets(login));
      // })

      // console.log(posts)

      // billets.then(data => console.log(data));

      // console.log('===billets2===', billets['[[PromiseValue]]']);
      const billetsCards = (billets) => {
        // return (
        //   <>
        //     {billets.map((billets, i) => {
        //       console.log("Entered", billets, i);
        //       // Return the element. Also pass key     
        //       return (<p>{billets.title}</p>)
        //     })}
        //   </>
        // )
      }



      const billetForm = () => (
        <form>
          <div className="form-group">
            <label className="text-muted">Title</label>
            <input
              onChange={handleChange("title")}
              value={title}
              type="text"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="text-muted">Content</label>
            <input
              onChange={handleChange("content")}
              value={content}
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
          {/* {JSON.stringify({ title, content, password, confirmationPassword })} */}
          {/* <code>{JSON.stringify(match, null, 2)}</code> */}
          {/* <code>{JSON.stringify(location, null, 2)}</code> */}
          {/* <code>{JSON.stringify(isAuth()._id)}</code> */}
          <div className="row">
            <div className="mx-auto col-6">
              <h1 className="p-5 text-center">{login}'s Blog Page</h1>
              {/* {billetForm()} */}
              {/* {getAllBillets()} */}
              {/* {billets.then(billets => billetsCards(billets))} */}
              {/* {billetsCards()} */}
            </div>
          </div>
        </Layout>
      );

    }).catch(error => {
      console.log(`====ERROR===== GETTING BILLETS OF ${match.params.login}`, error.response.data)
      toast.error(error.response.data.error)
    })

};

export default Blog;
