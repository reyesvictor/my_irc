import React from "react";
import Layout from "./core/Layout";
import ReactDOM from "react-dom";
import { Link, Redirect } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth } from "./auth/helpers";

const App = ({ match, location }) => {
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [blogs, setBlogs] = React.useState([]);
  //state and state hook
  const [values, setValues] = React.useState({
    title: "Some Original Title",
    content: "Some interesting content....",
    commentContent: "Some comment...",
    user_id: isAuth() !== null ? isAuth()._id : false,
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

  const blogsCards = () => {
    if (error) {
      return <div>Error : {error.message}</div>;
    } else if (!isLoaded) {
      return <div>There are no posts yet.</div>;
    } else {
      return (
        // <>
          <div className="card mt-2" key="all">
            <div className="card-body">
              <h5 className="card-title">Blog's List</h5>
              <p className="card-text">Discover all the blogs !</p>
              {blogs.map(item => <li className="list-group-item"><a href={'/' + item.login + '/'}>{item.login}'s Blog</a></li> )}
            </div>
            <div className="card-footer text-muted">
            </div>
          </div>
        // </>
      )
    }
  }


  const billetCards = () => {
    if (error) {
      return <div>Error : {error.message}</div>;
    } else if (!isLoaded) {
      return <div>There are no posts yet.</div>;
    } else {
      return (
        <>
          {items.map(item => (
            <div className="card mt-2" key={item._id}>
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.content}</p>
                <div className="flex-row d-flex mb-3">
                </div>
                {item.comments.length > 0 ?
                  item.comments.map(comment => (
                    <li className="list-group-item">
                      <a href={'/' + comment.user_login + '/'}>{comment.user_login}</a> {' said: ' + comment.content}
                    </li>
                  ))
                  : null
                }
              </div>
              <div className="card-footer text-muted">
                Author: {item.user_login}
              </div>
            </div>
          ))
          }
        </>
      );
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="row">
        <div className="mx-auto col-6">
          <div className="card mt-2">
            <div className="card-body">
              <h1 className="card-title p-5 text-center">Home App Page</h1>
            </div>
          </div>
          {blogsCards()}
          {billetCards()}
        </div>
      </div>
    </Layout>
  );

}

export default App;