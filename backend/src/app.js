const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { CLIENT_URL } = require("./config/env");
const errorMiddleware = require("./middlewares/errorMiddleware");
const session = require("express-session");
const passport = require("./config/passport");



const app = express();
app.use(
  session({
    secret: require("./config/env").SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Routes will be mounted here as we build them
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/interviews", require("./routes/interviewRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/speech", require("./routes/speechRoutes"));

app.use(errorMiddleware);

module.exports = app;