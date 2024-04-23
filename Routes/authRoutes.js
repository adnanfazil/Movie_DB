const express = require("express");
const Router = express.Router();
const authControllers = require("./../Controllers/authController");

// Route to render the signup form
Router.get('/signup',authControllers.showform)
Router.post("/signup", authControllers.signUp);
Router.get("/login", authControllers.showloginform);
Router.post("/login", authControllers.login);
Router.post("/forgotPassword", authControllers.forgotPassword);

module.exports = Router;
