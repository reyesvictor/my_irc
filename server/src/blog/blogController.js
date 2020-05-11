const Blog = require("./blogModel");
const User = require("../user/userModel");
const Comment = require("./commentModel");
const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
var ObjectId = require('mongoose').Types.ObjectId;

const saveBillet = (newBillet, res) => {
  return new Promise((resolve, reject) => {
    newBillet.save((err, success) => {
      if (err) {
        console.log("===Create Billet ERROR===", err);
        resolve(res.status(400).json({ error: err, }));
      } else {
        resolve(res.status(200).json({ message: "New Billet Created." }));
      }
      res.end();
    });
  })
}

exports.create = async (req, res) => {
  let { title, content, user_id, user_login } = req.body;
  const search = async (title) => { return await Blog.findOne({ title }).then(blog => blog) };
  const result = await search(title);
  if (result && result._id) {
    console.log('======Already Existing Blog() Billet=======', result)
    res.status(400).json({ error: 'Title is taken.' })
    res.end();
  } else {
    // let newBillet = await new Blog({ title, content, user_id });
    const createNew = async (billet) => { return await new Blog(billet) };
    const newBillet = await createNew({ title, content, user_id, user_login });
    console.log('======New Blog() Billet=======', newBillet)
    saveBillet(newBillet, res);
  }
};

exports.read = async (req, res) => {
  console.log("VERIF COMMENTAIRES =========", req.body)
  const { login } = req.params;
  console.log('==logiiiiiin==', login);
  const searchUser = async (login) => { return await User.findOne({ login }).then(user => user._id) };
  const id = await searchUser(login);
  console.log('==iddddddddd==', id);
  const searchBillets = async (id) => { return await Blog.find({ user_id: new ObjectId(id) }).then(billets => billets) };
  const billets = await searchBillets(id);
  console.log('=====Billets After Comment Loading=====', billets);
  if (billets) {
    res.status(200).json({ message: 'Billets found.', billets: billets.reverse() })

  } else {
    res.status(400).json({ error: 'Billets do not exist.' })
  }
};


exports.billetDelete = async (req, res) => {
  const { _id } = req.params;
  const del = async (_id) => { return await Blog.deleteOne({ _id: new ObjectId(_id) }) };
  const result = await del(_id);

  console.log('=====Delete=====', result);

  if (result.deletedCount === 1) {
    res.status(200).json({ message: 'Billet deleted.' })
  } else {
    res.status(400).json({ error: 'Billets does not exist.' })
  }
}

exports.edit = async (req, res) => {
  const { _id, title, content } = req.body;
  const update = async (_id) => { return await Blog.updateOne({ _id: new ObjectId(_id) }, { title, content }) };
  const result = await update(_id);
  console.log('=====Edit=====', req.body, result);
  if (result === null) {
    res.status(400).json({ error: 'Billets has not been updated.' })
  } else {
    res.status(200).json({ message: 'Billet has been updated.', billet: result })
  }
}

exports.billetCheck = async (req, res) => {
  const { _id } = req.params;
  const get = async (_id) => { return await Blog.findOne({ _id: new ObjectId(_id) }) };
  const result = await get(_id);
  console.log('=====Check=====', result, req.params);
  if (result === null) {
    res.status(400).json({ error: 'Billets does not exist.' })
  } else {
    res.status(200).json({ message: 'Billet exists.', billet: result })
  }
}

exports.commentCreate = async (req, res) => {
  console.log('=====Comment Create=====', req.body);
  const { billet_id, content, user_login } = req.body;

  const searchBillets = async (billet_id) => { return await Blog.findOne({ _id: new ObjectId(billet_id) }).then(billets => billets) };
  const billet = await searchBillets(billet_id);

  try {
    billet.comments.push({ content, user_login, createdAt: new Date() });
    billet.save();
    res.status(200).json({ message: "New Comment Created." });
    res.end();
  } catch (error) {
    res.status(400).json({ error: err, });
    res.end();
  }
}



exports.commentDelete = async (req, res) => {
  console.log('=====Comment Delete=====', req.body);
  const { user_login, content, _id, createdAt } = req.body;
  try {
    // Blog.update(
    //   { _id: new ObjectId("5eb66d3f1008f943d8c2fc71") },
    //   { $pull: { "comments" : { content:"Salut Salut les amis" } } }
    // );
    Blog.findByIdAndUpdate(
      new ObjectId(_id),
      { $pull: { "comments": { content, user_login, createdAt: new Date(createdAt) } } },
      { safe: true, upsert: true, new: false },
      function (err, model) {
        console.log(err);
      }
    );
    res.status(200).json({ message: "Comment Deleted." });
    res.end();
  } catch (error) {
    res.status(400).json({ error: error, });
    res.end();
  }
}

exports.getAll = async (req, res) => {
  const searchBillets = async () => { return await Blog.find().then(billets => billets) };
  const billets = await searchBillets();
  const searchBlogs = async () => { return await User.find().then(blogs => blogs) };
  const blogs = await searchBlogs();
  console.log('=====All Billets HOMEPAGE=====', billets);
  if (billets && blogs) {
    res.status(200).json({ message: 'Billets found.', billets: billets.reverse(), blogs: blogs.reverse() })
  } else {
    res.status(400).json({ message: 'No billets found.', billets: billets.reverse(), blogs: blogs.reverse() })
  }
};

exports.search = async (req, res) => {
  let search = req.params.params;
  search = search.replace(/ /gi, "\|");
  console.log('===Search====', req.body, req.params, req.query, search);
  // Blog.find({ title: new RegExp('^' + search + '$', "i") }, function (err, doc) {
  // });
  // const searchAll = async () => { return await Blog.find({ title: new RegExp('^' + search + '$', "i") }).then(results => results) };
  //un mot avec le titre
  const searchAll = async () => {
    return await Blog.find({
      $or: [
        { "title": { "$regex": search, "$options": "i" } },
        { "content": { "$regex": search, "$options": "i" } },
      ]
    }).then(results => results)
  };
  const results = await searchAll();
  console.log('=======results search=======', results);
  res.status(200).json({ billets: results })
  res.end();
  // if ( results) {
  // } else {
  //   res.status(400).json({ error: 'Nothing found.'})
  // }

  // const searchBillets = async () => { return await Blog.find().then(billets => billets) };
  // const billets = await searchBillets();
  // const searchBlogs = async () => { return await User.find().then(blogs => blogs) };
  // const blogs = await searchBlogs();
  // console.log('=====All Billets HOMEPAGE=====', billets);
  // billets: billets.reverse(), blogs: blogs.reverse()
};
