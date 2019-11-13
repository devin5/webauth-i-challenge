const express = require("express");
const configureMiddleware = require("./middleware/configure-middleware");
const session = require("express-session");
const KnexSessionStorage = require("connect-session-knex")(session);
require("dotenv").config();

// const knexConnection = require("./data/dbConfig");

const authRouter = require("./auth/authRouter.js");

const server = express();

const sessionConfiguration = {
  name: "booger", // default name is sid
  secret: process.env.COOKIE_SECRET || "is it secret? is it safe?",
  cookie: {
    maxAge: 1000 * 60 * 60, // valid for 1 hour (in milliseconds)
    secure: process.env.NODE_ENV === "development" ? false : true, // do we send cookie over https only?
    httpOnly: true // prevent client javascript code from accessing the cookie
  },
  resave: false, // save sessions even when they have not changed
  saveUninitialized: true, // read about it on the docs to respect GDPR
  store: new KnexSessionStorage({
    knex: require("./data/dbConfig"),
    clearInterval: 1000 * 60 * 10, // delete expired sessions every 10 minutes
    tablename: "knexsessions",
    sidfieldname: "sessionid",
    createtable: true
  })
};

// 3: use the session middleware globally
configureMiddleware(server);
server.use(express.json());
server.use(session(sessionConfiguration));
server.use("/api/auth", authRouter);
server.get("/", (req, res) => {
  res.json({ api: "up", session: req.session });
});

module.exports = server;
