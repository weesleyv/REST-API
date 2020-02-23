const express = require("express");
const router = express.Router();
const Course = require("../models").Course;
const User = require("../models").User;
const functions = require("./functions");

//Returns a list of courses (including the user that owns each course)
router.get(
  "/courses",
  functions.asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"]
          }
        }
      ]
    });
    res.json(courses);
  })
);

//Returns a the course (including the user that owns the course) for the provided course ID
router.get(
  "/courses/:id",
  functions.asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: {
        exclude: ["createdAt", "updatedAt"]
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"]
          }
        }
      ]
    });
    res.json(course);
  })
);

//Creates a course, sets the Location header to the URI for the course, and returns no content
router.post(
  "/courses",
  functions.authenticateUser,
  functions.asyncHandler(async (req, res) => {
    try {
        console.log(req.body);
      const course = await Course.create(req.body);
      res
        .status(201)
        .location("/courses/" + course.id)
        .end();
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errMsg = error.errors.map(error => error.message);
        res.status(400).json(errMsg);
      }
    }
  })
);

//Updates a course and returns no content
router.put(
  "/courses/:id",
  functions.authenticateUser,
  functions.asyncHandler(async (req, res) => {
    try {
      const user = req.currentUser;
      const course = await Course.findByPk(req.params.id);
      if (user.id === course.userId) {
        if (req.body.title && req.body.description) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            res.status(400).json({ message: "title is required,  description is required" });
        }
      } else {
        res.status(403).json({ message: "You don't have permissions" });
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errMSg = error.errors.map(error => error.message);
        res.status(400).json(errMsg);
      }
    }
  })
);

//Deletes a course and returns no content
router.delete(
  "/courses/:id",
  functions.authenticateUser,
  functions.asyncHandler(async (req, res) => {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    if (user.id === course.userId) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: "You don't have permissions" });
    }
  })
);

module.exports = router;
