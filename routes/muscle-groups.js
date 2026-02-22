const express = require('express');
const router = express.Router();

// GET /api/muscle-groups — List muscle groups (optionally filter by date)
router.get('/', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { date } = req.query;

        let query = 'SELECT * FROM muscle_groups';
        const params = [];

        if (date) {
            query += ' WHERE date = ?';
            params.push(date);
        }

        query += ' ORDER BY id';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching muscle groups:', err);
        res.status(500).json({ error: 'Failed to fetch muscle groups' });
    }
});

// GET /api/muscle-groups/distinct-groups — Get all unique muscle group names from DB
router.get('/distinct-groups', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const [rows] = await pool.query(
            'SELECT DISTINCT LOWER(muscle_group) AS muscle_group FROM muscle_groups ORDER BY muscle_group'
        );
        res.json(rows.map(r => r.muscle_group));
    } catch (err) {
        console.error('Error fetching distinct muscle groups:', err);
        res.status(500).json({ error: 'Failed to fetch muscle groups' });
    }
});

// GET /api/muscle-groups/movements?muscle_group=X — Get previously logged movements for a muscle group
router.get('/movements', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { muscle_group } = req.query;

        if (!muscle_group) {
            // Return all distinct movement names
            const [rows] = await pool.query(
                'SELECT DISTINCT movement_name FROM muscle_groups ORDER BY movement_name'
            );
            return res.json(rows.map(r => r.movement_name));
        }

        // Case-insensitive match for muscle group
        const [rows] = await pool.query(
            'SELECT DISTINCT movement_name FROM muscle_groups WHERE LOWER(muscle_group) = LOWER(?) ORDER BY movement_name',
            [muscle_group.trim()]
        );
        res.json(rows.map(r => r.movement_name));
    } catch (err) {
        console.error('Error fetching movements:', err);
        res.status(500).json({ error: 'Failed to fetch movements' });
    }
});

// GET /api/muscle-groups/:id — Get single muscle group with its sets
router.get('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        const [groups] = await pool.query(
            'SELECT * FROM muscle_groups WHERE id = ?', [id]
        );
        if (groups.length === 0) {
            return res.status(404).json({ error: 'Muscle group entry not found' });
        }

        const muscleGroup = groups[0];

        // Get sets for this muscle group
        const [sets] = await pool.query(
            'SELECT * FROM set_information WHERE reference_muscle = ? ORDER BY id', [id]
        );
        muscleGroup.sets = sets;

        res.json(muscleGroup);
    } catch (err) {
        console.error('Error fetching muscle group:', err);
        res.status(500).json({ error: 'Failed to fetch muscle group' });
    }
});

// POST /api/muscle-groups — Create muscle group entry
router.post('/', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { date, muscle_group, movement_name, set_number } = req.body;

        const [result] = await pool.query(
            'INSERT INTO muscle_groups (date, muscle_group, movement_name, set_number) VALUES (?, ?, ?, ?)',
            [date, muscle_group, movement_name, set_number]
        );

        const [created] = await pool.query(
            'SELECT * FROM muscle_groups WHERE id = ?', [result.insertId]
        );
        res.status(201).json(created[0]);
    } catch (err) {
        console.error('Error creating muscle group:', err);
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'No workout exists for this date. Create a workout first.' });
        }
        res.status(500).json({ error: 'Failed to create muscle group entry' });
    }
});

// PUT /api/muscle-groups/:id — Update muscle group entry
router.put('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;
        const { date, muscle_group, movement_name, set_number } = req.body;

        const [result] = await pool.query(
            'UPDATE muscle_groups SET date = ?, muscle_group = ?, movement_name = ?, set_number = ? WHERE id = ?',
            [date, muscle_group, movement_name, set_number, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Muscle group entry not found' });
        }

        const [updated] = await pool.query(
            'SELECT * FROM muscle_groups WHERE id = ?', [id]
        );
        res.json(updated[0]);
    } catch (err) {
        console.error('Error updating muscle group:', err);
        res.status(500).json({ error: 'Failed to update muscle group entry' });
    }
});

// DELETE /api/muscle-groups/:id — Delete muscle group entry (also deletes related sets)
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        // Delete associated sets first
        await pool.query(
            'DELETE FROM set_information WHERE reference_muscle = ?', [id]
        );

        const [result] = await pool.query(
            'DELETE FROM muscle_groups WHERE id = ?', [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Muscle group entry not found' });
        }

        res.json({ message: 'Muscle group entry deleted successfully' });
    } catch (err) {
        console.error('Error deleting muscle group:', err);
        res.status(500).json({ error: 'Failed to delete muscle group entry' });
    }
});

module.exports = router;
