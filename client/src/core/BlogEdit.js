import React from "react";
import ReactDOM from "react-dom";
import { Link, Redirect } from "react-router-dom";
import Layout from "./Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth } from "../auth/helpers";

const BlogEdit = ({ match, location }) => {
  
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [item, setItems] = React.useState([]);
  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/blog/billetEdit/${billet_id}/check/`)
      .then(res => res.json())
      .then(
        (result) => {
          console.log('=====billet=====', result);
          setIsLoaded(true);
          setItems(result.billet);
        },
        // Remarque : il faut gérer les erreurs ici plutôt que dans
        // un bloc catch() afin que nous n’avalions pas les exceptions
        // dues à de véritables bugs dans les composants.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  
  //state and state hook
  const [values, setValues] = React.useState({
    title: item.title,
    content: item.content,
    user_id: isAuth()._id,
    billet_id: match.params._id,
    buttonText: "Update"
  });

  const { title, content, password, user_id, billet_id, buttonText } = values;
  const handleChange = title => event => {
    // console.log(event.target);
    setValues({ ...values, [title]: event.target.value });
  };

  // const clickSubmit = (event) => {
  //   console.log(event.target.value);
  //   event.preventDefault();
  //   setValues({ ...values, buttonText: 'Submitting...' })
  //   axios({
  //     method: 'POST',
  //     url: `${process.env.REACT_APP_API}/blog/billetCreate`,
  //     data: { title, content, user_id }
  //   })
  //     .then(response => {
  //       console.log('REGISTER SUCCESS', response)
  //       setValues({ ...values, title: '', content: '', buttonText: 'Submitted' })
  //       toast.success(response.data.message)
  //     })
  //     .catch(error => {
  //       console.log('REGISTER ERROR', error.response.data)
  //       setValues({ ...values, buttonText: 'Submit' })
  //       toast.error(error.response.data.error)
  //     })
  // };

  const clickUpdate = (event) => {
    event.preventDefault();
    axios({
      method: 'POST',
      url: process.env.REACT_APP_API + "/blog/billetEdit/" + billet_id + "/edit",
      data: { _id:billet_id, title, content }
    })
      .then(response => {
        toast.success(response.data.message);
        // window.location.reload(false);
      })
      .catch(error => toast.error(error.response.data.error))
  };

  const billetForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Title</label>
        <input
          placeholder={item.title}
          onChange={handleChange("title")}
          type="text"
          className="form-control"
          name="title"
          value={title}
          />
      </div>
      <div className="form-group">
        <label className="text-muted">Content</label>
        <input
          placeholder={item.content}
          onChange={handleChange("content")}
          type="text"
          name="content"
          className="form-control"
          value={content}
        />
      </div>
      <div>
        <button className="btn btn-primary" onClick={clickUpdate}>
          {buttonText}
        </button>
      </div>
    </form>
  );

  // Remarque : le tableau vide de dépendances [] indique
  // que useEffect ne s’exécutera qu’une fois, un peu comme
  // componentDidMount()


  return (
    <Layout>
      <ToastContainer />
      {/* {JSON.stringify({ title, content, password, confirmationPassword })} */}
      {/* <code>{JSON.stringify(match, null, 2)}</code> */}
      {/* <code>{JSON.stringify(location, null, 2)}</code> */}
      {/* <code>{JSON.stringify(isAuth()._id)}</code> */}
      <div className="row">
        <div className="mx-auto col-6">
          <div className="card mt-2">
            <div className="card-body">
              <h1 className="card-title p-5 text-center">Edit Page</h1>
              {billetForm()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );

}

export default BlogEdit;