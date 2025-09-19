import { Router } from 'express';
import Joi from 'joi';
import { getDatabase } from '../models/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { MoodEntry, TrendData } from '../types';

const router = Router();

// Apply authentication to all mood routes
router.use(authenticateToken);

// Validation schema for mood entry
const moodEntrySchema = Joi.object({
  happiness: Joi.number().min(0).max(1).required(),
  stress: Joi.number().min(0).max(1).required(),
  valence: Joi.number().min(-1).max(1).required(),
  arousal: Joi.number().min(0).max(1).required(),
  confidence: Joi.number().min(0).max(1).required()
});

// Create mood entry
router.post('/entries', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = moodEntrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { happiness, stress, valence, arousal, confidence } = value;
    const db = getDatabase();

    db.run(
      `INSERT INTO mood_entries (user_id, happiness, stress, valence, arousal, confidence) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, happiness, stress, valence, arousal, confidence],
      function(err) {
        if (err) {
          return next(err);
        }

        res.status(201).json({
          message: 'Mood entry created successfully',
          id: this.lastID
        });
      }
    );
  } catch (err) {
    next(err);
  }
});

// Get mood entries with pagination
router.get('/entries', async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const db = getDatabase();

    db.all(
      `SELECT * FROM mood_entries 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [req.userId, limit, offset],
      (err, entries: MoodEntry[]) => {
        if (err) {
          return next(err);
        }

        // Get total count
        db.get(
          'SELECT COUNT(*) as total FROM mood_entries WHERE user_id = ?',
          [req.userId],
          (countErr, result: { total: number }) => {
            if (countErr) {
              return next(countErr);
            }

            res.json({
              entries,
              pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit)
              }
            });
          }
        );
      }
    );
  } catch (err) {
    next(err);
  }
});

// Get trend data
router.get('/trends/:period', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { period } = req.params;
    
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Must be daily, weekly, or monthly' });
    }

    const db = getDatabase();
    let dateFormat: string;
    let groupBy: string;

    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
        break;
      case 'weekly':
        dateFormat = '%Y-W%W';
        groupBy = 'strftime("%Y-W%W", created_at)';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        groupBy = 'strftime("%Y-%m", created_at)';
        break;
      default:
        return res.status(400).json({ error: 'Invalid period' });
    }

    db.all(
      `SELECT 
         strftime('${dateFormat}', created_at) as date,
         AVG(happiness) as happiness,
         AVG(stress) as stress,
         AVG(valence) as valence,
         AVG(arousal) as arousal,
         COUNT(*) as count
       FROM mood_entries 
       WHERE user_id = ? 
         AND created_at >= datetime('now', '-30 days')
       GROUP BY ${groupBy}
       ORDER BY date ASC`,
      [req.userId],
      (err, results) => {
        if (err) {
          return next(err);
        }

        const trendData: TrendData = {
          period: period as 'daily' | 'weekly' | 'monthly',
          data: results.map((row: any) => ({
            date: row.date,
            happiness: parseFloat(row.happiness.toFixed(3)),
            stress: parseFloat(row.stress.toFixed(3)),
            valence: parseFloat(row.valence.toFixed(3)),
            arousal: parseFloat(row.arousal.toFixed(3)),
            count: row.count
          }))
        };

        res.json(trendData);
      }
    );
  } catch (err) {
    next(err);
  }
});

// Delete mood entry
router.delete('/entries/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    db.run(
      'DELETE FROM mood_entries WHERE id = ? AND user_id = ?',
      [id, req.userId],
      function(err) {
        if (err) {
          return next(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Mood entry not found' });
        }

        res.json({ message: 'Mood entry deleted successfully' });
      }
    );
  } catch (err) {
    next(err);
  }
});

export { router as moodRoutes };