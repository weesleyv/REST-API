const auth = require("basic-auth");
const bcryptjs = require("bcryptjs");
const User = require("../models").User;

module.exports = {
  //Handle function to wrap each route
  asyncHandler: cb => {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  },
  //authentication middleware
  authenticateUser: async (req, res, next) => {
    let message = null;
    try {
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
    } catch (error) {
      console.log(error.message);
    }
  }
};
