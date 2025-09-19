import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { getDatabase } from '../models/database';
import { User } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  hasConsented: Joi.boolean().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, hasConsented } = value;

    if (!hasConsented) {
      return res.status(400).json({ error: 'Consent is required to create an account' });
    }

    const db = getDatabase();
    const passwordHash = await bcrypt.hash(password, 12);

    db.run(
      `INSERT INTO users (email, password_hash, has_consented, consent_date) 
       VALUES (?, ?, ?, ?)`,
      [email, passwordHash, hasConsented, new Date().toISOString()],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
          return next(err);
        }

        // Create default user settings
        db.run(
          `INSERT INTO user_settings (user_id) VALUES (?)`,
          [this.lastID],
          (settingsErr) => {
            if (settingsErr) {
              console.error('Error creating user settings:', settingsErr);
            }
          }
        );

        const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
          message: 'User created successfully',
          token,
          userId: this.lastID
        });
      }
    );
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    const db = getDatabase();

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user: User) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
          message: 'Login successful',
          token,
          userId: user.id
        });
      }
    );
  } catch (err) {
    next(err);
  }
});

export { router as authRoutes };