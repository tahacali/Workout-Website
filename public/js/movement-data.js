/* ========================================
   Movement Data — Special Weight Labels Only
   Default is "Weight (kg)" — only exceptions listed here
   ======================================== */

// Movements with non-standard weight labels (case-insensitive matching)
const SPECIAL_WEIGHT_LABELS = {
    'assisted pull-up': 'Assist Level',
    'assisted chin-up': 'Assist Level',
    'assisted dip': 'Assist Level',
    'pull-up': 'Extra Weight (kg)',
    'chin-up': 'Extra Weight (kg)',
    'dip': 'Extra Weight (kg)',
    'push-up': 'Body Weight',
    'plank': 'Duration (sec)',
    'side plank': 'Duration (sec)',
    'ab wheel rollout': 'Body Weight',
};

/**
 * Get the weight label for a movement name (case-insensitive).
 * Returns "Weight (kg)" for all standard movements.
 * @param {string} movementName
 * @returns {string}
 */
function getWeightLabel(movementName) {
    if (!movementName) return 'Weight (kg)';
    const name = movementName.trim().toLowerCase();
    return SPECIAL_WEIGHT_LABELS[name] || 'Weight (kg)';
}

/**
 * Get a short unit suffix for display in history view.
 * @param {string} movementName
 * @returns {string}
 */
function getWeightUnit(movementName) {
    const label = getWeightLabel(movementName);
    switch (label) {
        case 'Assist Level': return 'lvl';
        case 'Duration (sec)': return 'sec';
        case 'Body Weight': return '';
        case 'Extra Weight (kg)': return 'kg';
        default: return 'kg';
    }
}
