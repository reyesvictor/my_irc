import React from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { isAuth } from "../auth/helpers";

const Blog = ({ match, location }) => {
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [items, setItems] = React.useState([]);
  //state and state hook
  const [values, setValues] = React.useState({
    title: "Some Original Title",
    content: "Some interesting content....",
    commentContent: "Some comment...",
    user_id: isAuth()._id,
    login: match.params.login,
    buttonText: "Submit"
  });

  // state = {
  //   items : setItems()
  // }
  const { title, content, commentContent, password, user_id, login, buttonText } = values;

  const handleChange = title => event => {
    setValues({ ...values, [title]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    fetch(`${process.env.REACT_APP_API}/blog/billetCreate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title, content, user_id, user_login: login
      }),
    })
    .then(res => res.json())
    .then(
      (result) => {
        setIsLoaded(true);
        setItems(result.billets);
      },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  };


  // const clickSubmit = (event) => {
  //   // console.log(event);
  //   event.preventDefault();
  //   setValues({ ...values, buttonText: 'Submitting...' })
  //   fetch({
  //     method: 'POST',
  //     url: `${process.env.REACT_APP_API}/blog/billetCreate`,
  //     data: { title, content, user_id, user_login: login }
  //   })
  //     .then(response => {
  //       console.log('REGISTER SUCCESS', response)
  //       setValues({ ...values, title: '', content: '', buttonText: 'Submitted' })
  //       toast.success(response.data.message)
  //       this.setState({
  //         items: response.billets
  //       });
  //     })
  //     .catch(error => {
  //       console.log('REGISTER ERROR', error.response.data)
  //       setValues({ ...values, buttonText: 'Submit' })
  //       toast.error(error.response.data.error)
  //     })
  // };

  const clickDelete = (end_url) => (event) => {
    console.log(end_url);
    event.preventDefault();
    axios({
      method: 'POST',
      url: process.env.REACT_APP_API + end_url,
      data: { title, content, user_id }
    })
      .then(response => {
        toast.success(response.data.message);
        window.location.reload(false);
      })
      .catch(error => toast.error(error.response.data.error))
  };

  const deleteComment = (user_login, content, _id, createdAt) => (event) => {
    console.log(content, _id);
    event.preventDefault();
    axios({
      method: 'DELETE',
      url: process.env.REACT_APP_API + '/blog/commentDelete',
      data: { user_login, content, _id, createdAt }
    })
      .then(response => {
        toast.success(response.data.message);
        // window.location.reload(false);
      })
      .catch(error => toast.error(error.response.data.error))
  };

  const commentSubmit = (_id) => (event) => {
    console.log(_id, commentContent, isAuth()._id);
    event.preventDefault();
    axios({
      method: 'POST',
      url: process.env.REACT_APP_API + '/blog/commentCreate',
      data: { billet_id: _id, content: commentContent, user_login: isAuth().login }
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

  const commentForm = (_id) => (
    <form className="card mt-3 p-2">
      <div className="form-group">
        <label className="text-muted">Comment</label>
        <input
          value={commentContent}
          placeholder="Comment here"
          name="content"
          type="text"
          className="form-control"
          onChange={handleChange("commentContent")}
        />
      </div>
      <div>
        <button className="btn btn-success" onClick={commentSubmit(_id)}>
          {buttonText}
        </button>
      </div>
    </form>
  );

  // Remarque : le tableau vide de dépendances [] indique
  // que useEffect ne s’exécutera qu’une fois, un peu comme
  // componentDidMount()
  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/blog/${login}/`)
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result.billets);
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


  const billetCards = () => {
    if (error) {
      return <div>Error : {error.message}</div>;
    } else if (!isLoaded) {
      return <div>This User Doesn't Have Any Posts</div>;
    } else {
      return (
        <>
          {items.map(item => (
            <div className="card mt-2" key={item._id}>
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.content}</p>
                <div className="flex-row d-flex mb-3">
                  <Link to={'/' + item.user_login + '/' + item._id} className="btn btn-primary mr-2">Details</Link>
                  {isAuth() && isAuth().login === login ?
                    <>
                      <Link to={'/' + item.user_id + '/' + item._id + '/edit'} className="btn btn-primary mr-2">Edit</Link>
                      <form>
                        <input hidden value={item._id} />
                        <button className="btn btn-danger" onClick={clickDelete('/blog/billetDelete/' + item._id)}>Delete</button>
                      </form>
                    </>
                    :
                    null
                  }
                </div>
                {isAuth().login === login ? null : <footer>{commentForm(item._id)}</footer>}
                {user_id !== item.user_id ? null :
                  item.comments.length > 0 ?
                    item.comments.map(comment => (
                      <li className="list-group-item">
                        {user_id !== item.user_id ? null : <button className="btn btn-warning mr-2" onClick={deleteComment(comment.user_login, comment.content, item._id, comment.createdAt)}>X</button>}
                        <a href={'/' + comment.user_login + '/'}>{comment.user_login}</a> {' said: ' + comment.content}
                      </li>
                    ))
                    : null
                }
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
      {/* {JSON.stringify({ title, content, password, confirmationPassword })} */}
      {/* <code>{JSON.stringify(match, null, 2)}</code> */}
      {/* <code>{JSON.stringify(location, null, 2)}</code> */}
      {/* <code>{JSON.stringify(isAuth()._id)}</code> */}
      <div className="row">
        <div className="mx-auto col-6">
          <div className="card mt-2">
            <div className="card-body">
              <h1 className="card-title p-5 text-center">{login}'s Blog Page</h1>
              {isAuth() && isAuth().login === login ?
                <span className="card-text">{billetForm()}</span>
                :
                null
              }
            </div>
          </div>
          {billetCards()}
        </div>
      </div>
    </Layout>
  );

}

export default Blog;