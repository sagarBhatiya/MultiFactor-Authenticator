import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import "./config/passportConfig.js";
dotenv.config();
dbConnect();

const app = express();

// Middleware setup
const corsOptions = {
  origin: ["http://localhost:3001"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 6000 * 60,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes

app.use("/api/auth", authRoutes);

// Listen
const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
