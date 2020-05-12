import React from "react";
import Layout from "./Layout";
import ReactDOM from "react-dom";
import { Link, Redirect } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const Home = ({ match, location }) => {
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [blogs, setBlogs] = React.useState([]);
  //state and state hook
  const [values, setValues] = React.useState({
    title: "Some Original Title",
    content: "Some interesting content....",
    commentContent: "Some comment...",
    login: match.params.login,
    buttonText: "Submit"
  });

  const { title, content, commentContent, password, user_id, login, buttonText } = values;

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/blog/billets/all`)
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result.billets);
          setBlogs(result.blogs);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  return (
    <Layout>
      <ToastContainer />
      <div className="row">
        <div className="mx-auto col-6">
          <div className="card mt-2">
            <div className="card-body">
              <h1 className="card-title p-5 text-center">Chat</h1>
            </div>
          </div>
          {/* {joinmodal()} */}
          {/* {createmodal()} */}
        </div>
      </div>
    </Layout>
  );

}

export default Home;