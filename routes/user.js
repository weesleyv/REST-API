const express = require("express");
const router = express.Router();
const User = require("../models").User;
const auth = require("basic-auth");
const bcryptjs = require("bcryptjs");

//Handle function to wrap each route
const asyncHandler = cb => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

//authentication middleware
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credetials = auth(req);
  if (credetials) {
    const user = await User.findOne({
      where: {
        emailAddress: credetials.name
      }
    });
    if (user) {
      const authenticated = bcryptjs.compareSync(
        credetials.pass,
        user.password
      );
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failure for user: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: "Access denied" });
  } else {
    next();
  }
};

router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddress
    });
  })
);

router.post(
  "/users",
  asyncHandler(async (req, res) => {
    console.log(req.body);
    let user;
    try {
      const userExist = await User.findOne({
        where: { emailAddress: req.body.emailAddress }
      });
      if (!userExist) {
        user = await User.create(req.body);
        res
          .status(201)
          .location("/")
          .end();
      } else {
        res.status(401).json("email already registered");
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        res.status(400);
        res.json(error.errors);
      }
    }
  })
);

module.exports = router;
