import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  authStatus,
  logout,
  setup2FA,
  verify2FA,
  reset2FA,
} from '../controllers/authController.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', passport.authenticate('local'), login);
router.get('/status', authStatus);
router.post('/logout', logout);

// Auth middleware
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Unauthorized' });
}

// Protected 2FA routes
router.post('/2fa/setup', requireAuth, setup2FA);
router.post('/2fa/verify', requireAuth, verify2FA);
router.post('/2fa/reset', requireAuth, reset2FA);

export default router;
