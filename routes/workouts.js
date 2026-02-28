const express = require('express');
const router = express.Router();

// GET /api/workouts — List all workouts
router.get('/', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            'SELECT * FROM workout ORDER BY Date DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// GET /api/workouts/last — Get the most recent workout before a given date
// Query param: ?date=YYYY-MM-DD (defaults to today)
router.get('/last', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const refDate = req.query.date || new Date().toISOString().split('T')[0];

        const [rows] = await pool.query(
            'SELECT Date FROM workout WHERE Date < ? ORDER BY Date DESC LIMIT 1',
            [refDate]
        );
        if (rows.length === 0) {
            return res.json({ lastDate: null, daysSince: null });
        }
        const lastDate = rows[0].Date;
        const ref = new Date(refDate + 'T00:00:00');
        const last = new Date(lastDate);
        last.setHours(0, 0, 0, 0);
        const diffMs = ref.getTime() - last.getTime();
        const daysSince = Math.round(diffMs / (1000 * 60 * 60 * 24));
        res.json({ lastDate, daysSince });
    } catch (err) {
        console.error('Error fetching last workout:', err);
        res.status(500).json({ error: 'Failed to fetch last workout' });
    }
});

// GET /api/workouts/:id — Get single workout with muscle groups & sets
router.get('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        // Get workout
        const [workouts] = await pool.query(
            'SELECT * FROM workout WHERE workout_id = ?', [id]
        );
        if (workouts.length === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const workout = workouts[0];

        // Get muscle groups for this workout
        const [muscleGroups] = await pool.query(
            'SELECT * FROM muscle_groups WHERE date = ? ORDER BY id', [workout.Date]
        );

        // Get sets for each muscle group
        for (const mg of muscleGroups) {
            const [sets] = await pool.query(
                'SELECT * FROM set_information WHERE reference_muscle = ? ORDER BY id', [mg.id]
            );
            mg.sets = sets;
        }

        workout.muscleGroups = muscleGroups;
        res.json(workout);
    } catch (err) {
        console.error('Error fetching workout:', err);
        res.status(500).json({ error: 'Failed to fetch workout' });
    }
});

// POST /api/workouts — Create new workout (with optional nested muscle groups & sets)
router.post('/', async (req, res) => {
    const pool = req.app.locals.pool;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { Date: workoutDate, muscle_groups: muscleGroupsStr, days_since_last_workout, duration, muscleGroups } = req.body;

        // Insert workout
        const [workoutResult] = await connection.query(
            'INSERT INTO workout (Date, muscle_groups, days_since_last_workout, duration) VALUES (?, ?, ?, ?)',
            [workoutDate, muscleGroupsStr, days_since_last_workout, duration]
        );
        const workoutId = workoutResult.insertId;

        // Insert nested muscle groups & sets if provided
        if (muscleGroups && Array.isArray(muscleGroups)) {
            for (const mg of muscleGroups) {
                const [mgResult] = await connection.query(
                    'INSERT INTO muscle_groups (date, muscle_group, movement_name, set_number) VALUES (?, ?, ?, ?)',
                    [workoutDate, mg.muscle_group, mg.movement_name, mg.set_number]
                );
                const mgId = mgResult.insertId;

                // Insert sets for this muscle group
                if (mg.sets && Array.isArray(mg.sets)) {
                    for (const set of mg.sets) {
                        await connection.query(
                            'INSERT INTO set_information (reference_muscle, weight, movement) VALUES (?, ?, ?)',
                            [mgId, set.weight, set.reps]
                        );
                    }
                }
            }
        }

        await connection.commit();

        // Return the created workout
        const [created] = await pool.query(
            'SELECT * FROM workout WHERE workout_id = ?', [workoutId]
        );
        res.status(201).json(created[0]);
    } catch (err) {
        await connection.rollback();
        console.error('Error creating workout:', err);

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A workout for this date already exists' });
        }
        res.status(500).json({ error: 'Failed to create workout' });
    } finally {
        connection.release();
    }
});

// PUT /api/workouts/:id — Update workout (with full movement/set replacement)
router.put('/:id', async (req, res) => {
    const pool = req.app.locals.pool;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { Date: workoutDate, muscle_groups: muscleGroupsStr, days_since_last_workout, duration, muscleGroups } = req.body;

        // 1. Get the old workout to find its date (for deleting old muscle_groups)
        const [oldWorkouts] = await connection.query(
            'SELECT * FROM workout WHERE workout_id = ?', [id]
        );
        if (oldWorkouts.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Workout not found' });
        }
        const oldDate = oldWorkouts[0].Date;

        // 2. Delete old set_information rows (via old muscle_group ids)
        const [oldMgs] = await connection.query(
            'SELECT id FROM muscle_groups WHERE date = ?', [oldDate]
        );
        const oldMgIds = oldMgs.map(mg => mg.id);
        if (oldMgIds.length > 0) {
            await connection.query(
                'DELETE FROM set_information WHERE reference_muscle IN (?)', [oldMgIds]
            );
        }

        // 3. Delete old muscle_groups rows
        await connection.query('DELETE FROM muscle_groups WHERE date = ?', [oldDate]);

        // 4. Update workout-level fields
        await connection.query(
            'UPDATE workout SET Date = ?, muscle_groups = ?, days_since_last_workout = ?, duration = ? WHERE workout_id = ?',
            [workoutDate, muscleGroupsStr, days_since_last_workout, duration, id]
        );

        // 5. Re-insert movements & sets
        if (muscleGroups && Array.isArray(muscleGroups)) {
            for (const mg of muscleGroups) {
                const [mgResult] = await connection.query(
                    'INSERT INTO muscle_groups (date, muscle_group, movement_name, set_number) VALUES (?, ?, ?, ?)',
                    [workoutDate, mg.muscle_group, mg.movement_name, mg.set_number]
                );
                const mgId = mgResult.insertId;

                if (mg.sets && Array.isArray(mg.sets)) {
                    for (const set of mg.sets) {
                        await connection.query(
                            'INSERT INTO set_information (reference_muscle, weight, movement) VALUES (?, ?, ?)',
                            [mgId, set.weight, set.reps]
                        );
                    }
                }
            }
        }

        await connection.commit();

        // Return the updated workout
        const [updated] = await pool.query(
            'SELECT * FROM workout WHERE workout_id = ?', [id]
        );
        res.json(updated[0]);
    } catch (err) {
        await connection.rollback();
        console.error('Error updating workout:', err);
        res.status(500).json({ error: 'Failed to update workout' });
    } finally {
        connection.release();
    }
});

// DELETE /api/workouts/:id — Delete workout (cascades to muscle_groups)
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        // Get workout date first for cascade awareness
        const [workouts] = await pool.query(
            'SELECT * FROM workout WHERE workout_id = ?', [id]
        );
        if (workouts.length === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Delete associated set_information first (no cascade set up on set_information)
        const [muscleGroups] = await pool.query(
            'SELECT id FROM muscle_groups WHERE date = ?', [workouts[0].Date]
        );
        const mgIds = muscleGroups.map(mg => mg.id);
        if (mgIds.length > 0) {
            await pool.query(
                'DELETE FROM set_information WHERE reference_muscle IN (?)', [mgIds]
            );
        }

        // Delete workout (cascades to muscle_groups via FK)
        await pool.query('DELETE FROM workout WHERE workout_id = ?', [id]);

        res.json({ message: 'Workout deleted successfully' });
    } catch (err) {
        console.error('Error deleting workout:', err);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

module.exports = router;
