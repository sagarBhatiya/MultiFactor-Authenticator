import { Router } from "express";
import passport from "passport";
import {register,login,authStatus,logout,setup2FA,verify2FA,reset2FA} from '../controllers/authController.js';


const router = Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login",passport.authenticate("local"), login);

// Auth Status route
router.get("/status", authStatus);

// Logout route
router.post("/logout", logout);

// 2FA setup route
router.post("/2fa/setup", setup2FA);

// 2FA verify route
router.post("/2fa/verify", verify2FA);

// Reset Route
router.post("/2fa/reset", reset2FA);

export default router;
