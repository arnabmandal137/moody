import { Router } from 'express';
import { getDatabase } from '../models/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { MoodEntry, User } from '../types';

const router = Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// Get user profile
router.get('/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDatabase();

    db.get(
      'SELECT id, email, created_at, has_consented, consent_date FROM users WHERE id = ?',
      [req.userId],
      (err, user: Omit<User, 'password_hash'>) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
      }
    );
  } catch (err) {
    next(err);
  }
});

// Export user data
router.get('/export', async (req: AuthenticatedRequest, res, next) => {
  try {
    const format = req.query.format as string || 'json';
    
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be json or csv' });
    }

    const db = getDatabase();

    // Get user data
    db.get(
      'SELECT id, email, created_at, has_consented, consent_date FROM users WHERE id = ?',
      [req.userId],
      (userErr, user: Omit<User, 'password_hash'>) => {
        if (userErr) {
          return next(userErr);
        }

        // Get mood entries
        db.all(
          'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY created_at ASC',
          [req.userId],
          (entriesErr, entries: MoodEntry[]) => {
            if (entriesErr) {
              return next(entriesErr);
            }

            const exportData = {
              user: user,
              moodEntries: entries,
              exportedAt: new Date().toISOString(),
              totalEntries: entries.length
            };

            if (format === 'json') {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Content-Disposition', 'attachment; filename="moody-data.json"');
              res.json(exportData);
            } else if (format === 'csv') {
              // Convert to CSV format
              const csvHeader = 'Date,Happiness,Stress,Valence,Arousal,Confidence\n';
              const csvRows = entries.map(entry => 
                `${entry.created_at},${entry.happiness},${entry.stress},${entry.valence},${entry.arousal},${entry.confidence}`
              ).join('\n');
              
              const csvContent = csvHeader + csvRows;
              
              res.setHeader('Content-Type', 'text/csv');
              res.setHeader('Content-Disposition', 'attachment; filename="moody-data.csv"');
              res.send(csvContent);
            }
          }
        );
      }
    );
  } catch (err) {
    next(err);
  }
});

// Delete all user data
router.delete('/data', async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDatabase();

    // Delete mood entries first (foreign key constraint)
    db.run(
      'DELETE FROM mood_entries WHERE user_id = ?',
      [req.userId],
      (moodErr) => {
        if (moodErr) {
          return next(moodErr);
        }

        // Delete user settings
        db.run(
          'DELETE FROM user_settings WHERE user_id = ?',
          [req.userId],
          (settingsErr) => {
            if (settingsErr) {
              return next(settingsErr);
            }

            // Delete user account
            db.run(
              'DELETE FROM users WHERE id = ?',
              [req.userId],
              function(userErr) {
                if (userErr) {
                  return next(userErr);
                }

                if (this.changes === 0) {
                  return res.status(404).json({ error: 'User not found' });
                }

                res.json({ 
                  message: 'All user data deleted successfully' 
                });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    next(err);
  }
});

// Get user statistics
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDatabase();

    db.all(`
      SELECT 
        COUNT(*) as totalEntries,
        AVG(happiness) as avgHappiness,
        AVG(stress) as avgStress,
        AVG(valence) as avgValence,
        AVG(arousal) as avgArousal,
        MIN(created_at) as firstEntry,
        MAX(created_at) as lastEntry
      FROM mood_entries 
      WHERE user_id = ?
    `, [req.userId], (err, result: any[]) => {
      if (err) {
        return next(err);
      }

      const stats = result[0] as any;
      
      res.json({
        totalEntries: stats.totalEntries,
        averages: {
          happiness: stats.avgHappiness ? parseFloat(stats.avgHappiness.toFixed(3)) : 0,
          stress: stats.avgStress ? parseFloat(stats.avgStress.toFixed(3)) : 0,
          valence: stats.avgValence ? parseFloat(stats.avgValence.toFixed(3)) : 0,
          arousal: stats.avgArousal ? parseFloat(stats.avgArousal.toFixed(3)) : 0
        },
        firstEntry: stats.firstEntry,
        lastEntry: stats.lastEntry
      });
    });
  } catch (err) {
    next(err);
  }
});

export { router as userRoutes };