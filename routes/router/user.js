//routers of post users

const express = require("express");
const {
  register,
  login,
  deleteUser,
  updateUser,
  verifyAccount,
} = require("./../controller/user");

const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

const userRouter = express.Router();
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.delete("/deleteUser/:id", authentication, authorization, deleteUser);
userRouter.put("/updateUser/:id", authentication, authorization, updateUser);
userRouter.post("/active", verifyAccount);


module.exports = userRouter;
