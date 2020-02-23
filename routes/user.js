const express = require("express");
const router = express.Router();
const User = require("../models").User;
const functions = require("./functions");

router.get(
  "/users",
  functions.authenticateUser,
  functions.asyncHandler(async (req, res) => {
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
  functions.asyncHandler(async (req, res) => {
    try {
        const user = await User.create(req.body);
        res
          .status(201)
          .location("/")
          .end();
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errMsg = error.errors.map(err => err.message);
        res.status(400);
        res.json(errMsg);
      } else {
        throw error;
      }
    }
  })
);

module.exports = router;
