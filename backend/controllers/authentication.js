const router = require("express").Router();
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("json-web-token");

const { User } = db;

// POST /api/auth/register
router.post("/", async (req, res) => {
  let user = await User.findOne({
    where: { email: req.body.email },
  });
  if (
    !user ||
    !(await bcrypt.compare(req.body.password, user.passwordDigest))
  ) {
    res.status(404).json({
      message: `Could not find a user with the provided email and password`,
    });
  } else {
    const result = await jwt.encode(process.env.JWT_SECRET, {
      id: user.userId,
    });
    res.json({ user: user, token: result.value });
  }
});

// get the current user's login profile
router.get("/profile", async (req, res) => {
  try {
    // Split the authorization header into [ "Bearer", "TOKEN" ]:
    const [authenticationMethod, token] = req.headers.authorization.split(" ");

    if (authenticationMethod == "Bearer") {
      // Decode the JWT
      const result = await jwt.decode(process.env.JWT_SECRET, token);

      // Get user's login id from the payload
      const { id } = result.value;

      // Find the user using their id:
      let user = await User.findOne({
        where: {
          userId: id,
        },
      });
      res.json(user);
    }
  } catch {
    res.json(null);
  }
});

// logout the current user
router.post("/super-important-route", async (req, res) => {
  if (req.session.userId) {
    console.log("Do the really super important thing");
    res.send("Done");
  } else {
    console.log("You are not authorized to do the super important thing");
    res.send("Denied");
  }
});

module.exports = router;
