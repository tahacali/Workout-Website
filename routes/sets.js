const express = require('express');
const router = express.Router();

// GET /api/sets — List sets (optionally filter by muscle_group_id)
router.get('/', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { muscle_group_id } = req.query;

        let query = 'SELECT * FROM set_information';
        const params = [];

        if (muscle_group_id) {
            query += ' WHERE reference_muscle = ?';
            params.push(muscle_group_id);
        }

        query += ' ORDER BY id';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching sets:', err);
        res.status(500).json({ error: 'Failed to fetch sets' });
    }
});

// GET /api/sets/:id — Get single set
router.get('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM set_information WHERE id = ?', [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Set not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching set:', err);
        res.status(500).json({ error: 'Failed to fetch set' });
    }
});

// POST /api/sets — Create set entry
router.post('/', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { reference_muscle, weight, reps } = req.body;

        const [result] = await pool.query(
            'INSERT INTO set_information (reference_muscle, weight, movement) VALUES (?, ?, ?)',
            [reference_muscle, weight, reps]
        );

        const [created] = await pool.query(
            'SELECT * FROM set_information WHERE id = ?', [result.insertId]
        );
        res.status(201).json(created[0]);
    } catch (err) {
        console.error('Error creating set:', err);
        res.status(500).json({ error: 'Failed to create set' });
    }
});

// PUT /api/sets/:id — Update set
router.put('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;
        const { reference_muscle, weight, reps } = req.body;

        const [result] = await pool.query(
            'UPDATE set_information SET reference_muscle = ?, weight = ?, movement = ? WHERE id = ?',
            [reference_muscle, weight, reps, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Set not found' });
        }

        const [updated] = await pool.query(
            'SELECT * FROM set_information WHERE id = ?', [id]
        );
        res.json(updated[0]);
    } catch (err) {
        console.error('Error updating set:', err);
        res.status(500).json({ error: 'Failed to update set' });
    }
});

// DELETE /api/sets/:id — Delete set
router.delete('/:id', async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM set_information WHERE id = ?', [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Set not found' });
        }

        res.json({ message: 'Set deleted successfully' });
    } catch (err) {
        console.error('Error deleting set:', err);
        res.status(500).json({ error: 'Failed to delete set' });
    }
});

module.exports = router;
