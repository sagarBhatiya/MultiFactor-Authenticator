import bcrypt from "bcryptjs";
import passport from "passport";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
export const register = async (req, res) => {
  // Registration logic here
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }
    // Checking whether user already exist
    const existing = await User.findOne({ username }).exec();
    if (existing) {
      return res.status(409).json({ message: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      isMfaActive: false,
    });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Register error:", error);
    // Try to surface common errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate key error." });
    }
    return res.status(500).json({ message: "Server error." });
  }
};

export const login = async (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Server error." });
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || "Unauthorized" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return res.status(500).json({ message: "Login failed." });
        }
        const userObj = user.toObject ? user.toObject() : user;
        if (userObj && userObj.password) delete userObj.password;
        return res.status(200).json({ message: "Logged in.", user: userObj });
      });
    })(req, res, next);
  } catch (error) {
    console.error("Login unexpected error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const authStatus = async (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user;
    const userObj = user && user.toObject ? user.toObject() : user;
    if (userObj && userObj.password) delete userObj.password;
    return res.status(200).json({ authenticated: true, user: userObj });
  }
  return res.status(200).json({ authenticated: false });
};

export const logout = async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed." });
      }
      try {
        req.session?.destroy?.(() => {});
      } catch (e) {}
      return res.status(200).json({ message: "Logged out." });
    });
  } catch (error) {
    console.error("Logout unexpected error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const setup2FA = async (req, res) => {
  // 2FA setup logic here
  try {
    console.log("2FA setup initiated for user:", req.user);
    const user = req.user;
    var secret = speakeasy.generateSecret({ length: 20 });
    user.twoFASecret = secret.base32;
    user.isMfaActive = true;
    await user.save();
    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `MFA-App (${req.user.username})`,  
      issuer: "MFA-App",
      encoding: "base32",
    });
    const qrCodeDataURL = await qrcode.toDataURL(url);
    res.status(200).json({
      message: "2FA setup initiated.",
      qrCode:qrCodeDataURL,
      secret: secret.base32,
    });

    return res.status(200).json({ message: "2FA setup initiated." });
  } catch (error) {
    console.error("2FA setup error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
export const verify2FA = async (req, res) => {
  // 2FA verify logic here
};
export const reset2FA = async (req, res) => {
  // 2FA reset logic here
};
