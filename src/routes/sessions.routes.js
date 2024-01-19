import { Router } from "express";
import userModel from "../dao/models/user.model.js";
import passport from "passport";

const router = Router();

router.post('/register', passport.authenticate('register', {
    failureRedirect: 'api/session/fail-register',
  }), async (req, res) => {
    //const { first_name, last_name, email, age, password } = req.body;
    console.log("Registrando usuario:");
    res.status(201).send({ status: "success", message: "Usuario creado con extito." });

    // const exist = await userModel.findOne({ email });
    // if (exist) {
    //   return res
    //     .status(400)
    //     .send({ status: "error", message: "User already exists" });
    // }

  //   const user = {
  //     first_name,
  //     last_name,
  //     email,
  //     age,
  //     password,
  //   };

  //   const result = await userModel.create(user);
  //   res.send({
  //     status: "success",
  //     message: "Successfully created user with ID: " + result.id,
  //   });
})

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "api/session/fail-login",
  }), async (req, res) => {
    console.log("User found to login:");
    //const { email, password } = req.body;
    const user = req.user;
    console.log(user);

    req.session.user = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
    };

    if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
      req.session.rol = "admin";
      req.session.user = {
        name: "Admin",
        email: "adminCoder@coder.com",
        rol: "admin",
        age: 0,
      };

      return res.send({
        status: "success",
        payload: req.session.user,
        message: "Admin login done :)",
      });
    }

    //const user = await userModel.findOne({ email, password });

    if (!user) {
      return res
        .status(401)
        .send({ status: "error", error: "Incorrect credentials" });
    }

    req.session.rol = "user";
    req.session.user = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      rol: req.session.rol,
      age: user.age,
    };

    res.send({
      status: "success",
      payload: req.session.user,
      message: "User login done :)",
    });
  }
);

router.get("/fail-register", (req, res) => {
  res.status(401).send({ error: "Failed to process register!" });
});

router.get("/fail-login", (req, res) => {
  res.status(401).send({ error: "Failed to process login!" });
});

router.post("/logout", (req, res) => {
  const userName = req.session.user ? req.session.user.name : "Unknown User";
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res
        .status(500)
        .send({ status: "error", msg: "Internal Server Error" });
    }
    console.log(`User ${userName} logged out successfully.`);
    res.redirect("/users/login");
  });
});

export default router;
