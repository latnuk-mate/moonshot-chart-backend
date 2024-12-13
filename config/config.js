const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const usermodel = require('../Model/user')

module.exports = function () {
  const callback = async (email, password, done) => {
    const user = await usermodel.findOne({ email: email });

    try {
      if (!user) {
        return done(null, false, { message: "No user found" });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: "Invalid username or password!" });
      }

      return done(null, user);
    } catch (err) {
      console.log(err);
    }
  }; // verify callback function....


    // using LocalStrategy authentication....
  passport.use(new LocalStrategy({ usernameField: "email" }, callback));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    await usermodel.findById(id , function (err, user) {
      done(err, user);
    });
  });


};
