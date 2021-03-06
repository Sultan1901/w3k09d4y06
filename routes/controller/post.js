const postModel = require("../../db/models/post");
const commentModel = require("../../db/models/comment");


// add ,delete,update ,get => functions control the posts
const addPost = (req, res) => {
  const { description, img } = req.body;

  console.log(req.token);
  const newpost = new postModel({
    description,
    img,
    userId: req.token.id,
  });
  newpost
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};
/**
 *
 *  there function which delete like to post
 *
 */
const getPost = (req, res) => {
  postModel
    .find({ userId: req.token.id })
    .populate("commentId", "description -_id")

    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getPostById = (req, res) => {
  const { id } = req.params;
  postModel
    .find({ _id: id })
    .then((result) => {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json("post does not exist");
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const deletePost = (req, res) => {
  const { id } = req.params;

  postModel
    .findByIdAndRemove(id)
    .exec()
    .then((result) => {
      res.status(200).json("Deleted");
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};
const updatePost = (req, res) => {
  const { description } = req.body;
  const { id } = req.params;
  postModel
    .findByIdAndUpdate(id, { $set: { description: description } })
    .then((result) => {
      if (result) {
        res.status(200).json("updated");
      } else {
        res.status(404).json(err);
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

module.exports = {
  updatePost,
  deletePost,
  getPostById,
  getPost,
  addPost,
};
