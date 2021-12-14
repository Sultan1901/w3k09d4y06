const nodemailer = require("nodemailer");
//users controllers

const userModel = require("./../../db/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SALT = Number(process.env.SALT);
const SECKEY = process.env.SECKEY;
const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});
const register = async (req, res) => {
  const { email, password, role, username, img } = req.body;
  const semail = email.toLowerCase();
  const hashpass = await bcrypt.hash(password, SALT);
  const characters = "0123456789";
  let activeCode = "";
  for (let i = 0; i < 4; i++) {
    activeCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  const newUser = new userModel({
    email: semail,
    password: hashpass,
    username,
    img,
    role,
    activeCode,
  });
  newUser
    .save()
    .then((result) => {
      transport
        .sendMail({
          from: "mg7l@hotmail.com",
          to: semail,
          subject: "Please confirm your account",
          html: `<h1>Email Confirmation</h1>
              <h2>Hello ${semail}</h2>
              <h4>CODE: ${activeCode}</h4>
              <p>Thank you for registering. Please confirm your email by entring the code on the following link</p>
              <a href=https://social-media-project-frontend.herokuapp.com/verify_account/${result._id}> Click here</a>
              </div>`,
        })
        .catch((err) => console.log(err));
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const verifyAccount = async (req, res) => {
  const { id, code } = req.body;
  const user = await userModel.findOne({ _id: id });
  console.log(user);
  if (user.activeCode == code) {
    userModel
      .findByIdAndUpdate(id, { state: "Active", activeCode: "" }, { new: true })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  } else {
    res.status(400).json("Wrong code..");
  }
};
// can login with username or email or both all we accept there 
const login = (req, res) => {
  const { password, username, email } = req.body;
  userModel
    .findOne({ $or: [{ email }, { username }] })
    .then(async (result) => {
      if (result) {
        if (email === result.email || username === result.username) {
          // console.log(result);
          const payload = {
            role: result.role,
            id: result._id,
          };

          const crackedhashpwd = await bcrypt.compare(
            password,
            result.password
          );

          if (crackedhashpwd) {
            console.log(result.state);
            if (result.state == "Active") {
              const options = {
                expiresIn: "3600m",
              };

              const token = jwt.sign(payload, SECKEY, options);
              res.status(200).json({ result, token });
            } else {
              res.status(400).json("please Active your account");
            }
          } else {
            res.status(400).json("wrong email || password");
          }
        } else {
          res.status(400).json("wrong email || password");
        }
      } else {
        res.status(400).json("email does not ===> match our records");
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};
const deleteUser = (req, res) => {
  const { id } = req.params;

  userModel
    .findByIdAndRemove(id)
    .exec()
    .then((result) => {
      res.status(200).json("Deleted");
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};
const updateUser = (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  userModel
    .findByIdAndUpdate(id, { $set: { email: email } })
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
const checkEmail = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (user) {
    let passwordCode = "";
    const characters = "0123456789";
    for (let i = 0; i < 4; i++) {
      passwordCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    userModel
      .findByIdAndUpdate(user._id, { passwordCode }, { new: true })
      .then((result) => {
        transport
          .sendMail({
            from: process.env.EMAIL,
            to: result.email,
            subject: "Reset Your Password",
            html: `<h1>Reset Your Password</h1>
              <h2>Hello ${result.username}</h2>
              <h4>CODE: ${passwordCode}</h4>
              <p>Please enter the code on the following link and reset your password</p>
              <a href=https://social-media-project-frontend.herokuapp.com/reset_password/${result._id}> Click here</a>
              </div>`,
          })
          .catch((err) => console.log(err));
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  } else {
    res.status(400).json("No user with this email");
  }
};
const resetPassword = async (req, res) => {
  const { id, code, password } = req.body;
  const user = await userModel.findOne({ _id: id });
  if (user.passwordCode == code) {
    const hashedPassword = await bcrypt.hash(password, SALT);
    userModel
      .findByIdAndUpdate(
        id,
        { password: hashedPassword, passwordCode: "" },
        { new: true }
      )
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  } else {
    res.status(400).json("Wrong Code...");
  }
};

module.exports = {
  register,
  login,
  deleteUser,
  updateUser,
  verifyAccount,
  resetPassword,
checkEmail 

};
