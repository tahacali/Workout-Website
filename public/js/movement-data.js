/* ========================================
   Movement Data — Muscle Group → Movement Mapping
   & Special Weight Label Configuration
   ======================================== */

// Movements organized by muscle group (case-insensitive matching)
const MOVEMENT_DATA = {
    chest: [
        { name: 'Bench Press', weightLabel: 'Weight (kg)' },
        { name: 'Incline Bench Press', weightLabel: 'Weight (kg)' },
        { name: 'Decline Bench Press', weightLabel: 'Weight (kg)' },
        { name: 'Dumbbell Fly', weightLabel: 'Weight (kg)' },
        { name: 'Incline Dumbbell Fly', weightLabel: 'Weight (kg)' },
        { name: 'Cable Crossover', weightLabel: 'Weight (kg)' },
        { name: 'Chest Press Machine', weightLabel: 'Weight (kg)' },
        { name: 'Push-up', weightLabel: 'Body Weight' },
        { name: 'Dumbbell Press', weightLabel: 'Weight (kg)' },
        { name: 'Incline Dumbbell Press', weightLabel: 'Weight (kg)' },
        { name: 'Pec Deck', weightLabel: 'Weight (kg)' },
    ],
    back: [
        { name: 'Lat Pulldown', weightLabel: 'Weight (kg)' },
        { name: 'Barbell Row', weightLabel: 'Weight (kg)' },
        { name: 'Cable Row', weightLabel: 'Weight (kg)' },
        { name: 'Seated Row', weightLabel: 'Weight (kg)' },
        { name: 'T-Bar Row', weightLabel: 'Weight (kg)' },
        { name: 'Pull-up', weightLabel: 'Extra Weight (kg)' },
        { name: 'Assisted Pull-up', weightLabel: 'Assist Level' },
        { name: 'Chin-up', weightLabel: 'Extra Weight (kg)' },
        { name: 'Assisted Chin-up', weightLabel: 'Assist Level' },
        { name: 'Dumbbell Row', weightLabel: 'Weight (kg)' },
        { name: 'Deadlift', weightLabel: 'Weight (kg)' },
        { name: 'Face Pull', weightLabel: 'Weight (kg)' },
        { name: 'Hyperextension', weightLabel: 'Weight (kg)' },
    ],
    shoulders: [
        { name: 'Overhead Press', weightLabel: 'Weight (kg)' },
        { name: 'Dumbbell Shoulder Press', weightLabel: 'Weight (kg)' },
        { name: 'Lateral Raise', weightLabel: 'Weight (kg)' },
        { name: 'Front Raise', weightLabel: 'Weight (kg)' },
        { name: 'Rear Delt Fly', weightLabel: 'Weight (kg)' },
        { name: 'Arnold Press', weightLabel: 'Weight (kg)' },
        { name: 'Upright Row', weightLabel: 'Weight (kg)' },
        { name: 'Cable Lateral Raise', weightLabel: 'Weight (kg)' },
        { name: 'Shoulder Press Machine', weightLabel: 'Weight (kg)' },
        { name: 'Shrugs', weightLabel: 'Weight (kg)' },
    ],
    biceps: [
        { name: 'Bicep Curl', weightLabel: 'Weight (kg)' },
        { name: 'Hammer Curl', weightLabel: 'Weight (kg)' },
        { name: 'Concentration Curl', weightLabel: 'Weight (kg)' },
        { name: 'Preacher Curl', weightLabel: 'Weight (kg)' },
        { name: 'Cable Curl', weightLabel: 'Weight (kg)' },
        { name: 'Incline Dumbbell Curl', weightLabel: 'Weight (kg)' },
        { name: 'EZ-Bar Curl', weightLabel: 'Weight (kg)' },
        { name: 'Spider Curl', weightLabel: 'Weight (kg)' },
    ],
    triceps: [
        { name: 'Tricep Pushdown', weightLabel: 'Weight (kg)' },
        { name: 'Overhead Tricep Extension', weightLabel: 'Weight (kg)' },
        { name: 'Skull Crusher', weightLabel: 'Weight (kg)' },
        { name: 'Dip', weightLabel: 'Extra Weight (kg)' },
        { name: 'Assisted Dip', weightLabel: 'Assist Level' },
        { name: 'Close-grip Bench Press', weightLabel: 'Weight (kg)' },
        { name: 'Cable Overhead Extension', weightLabel: 'Weight (kg)' },
        { name: 'Kickback', weightLabel: 'Weight (kg)' },
    ],
    legs: [
        { name: 'Squat', weightLabel: 'Weight (kg)' },
        { name: 'Leg Press', weightLabel: 'Weight (kg)' },
        { name: 'Leg Extension', weightLabel: 'Weight (kg)' },
        { name: 'Leg Curl', weightLabel: 'Weight (kg)' },
        { name: 'Lunge', weightLabel: 'Weight (kg)' },
        { name: 'Bulgarian Split Squat', weightLabel: 'Weight (kg)' },
        { name: 'Hack Squat', weightLabel: 'Weight (kg)' },
        { name: 'Romanian Deadlift', weightLabel: 'Weight (kg)' },
        { name: 'Stiff Leg Deadlift', weightLabel: 'Weight (kg)' },
        { name: 'Hip Thrust', weightLabel: 'Weight (kg)' },
        { name: 'Glute Kickback', weightLabel: 'Weight (kg)' },
        { name: 'Calf Raise', weightLabel: 'Weight (kg)' },
        { name: 'Seated Calf Raise', weightLabel: 'Weight (kg)' },
        { name: 'Goblet Squat', weightLabel: 'Weight (kg)' },
        { name: 'Sumo Squat', weightLabel: 'Weight (kg)' },
    ],
    quadriceps: [
        { name: 'Squat', weightLabel: 'Weight (kg)' },
        { name: 'Leg Press', weightLabel: 'Weight (kg)' },
        { name: 'Leg Extension', weightLabel: 'Weight (kg)' },
        { name: 'Lunge', weightLabel: 'Weight (kg)' },
        { name: 'Hack Squat', weightLabel: 'Weight (kg)' },
        { name: 'Bulgarian Split Squat', weightLabel: 'Weight (kg)' },
        { name: 'Front Squat', weightLabel: 'Weight (kg)' },
    ],
    hamstrings: [
        { name: 'Romanian Deadlift', weightLabel: 'Weight (kg)' },
        { name: 'Leg Curl', weightLabel: 'Weight (kg)' },
        { name: 'Stiff Leg Deadlift', weightLabel: 'Weight (kg)' },
        { name: 'Seated Leg Curl', weightLabel: 'Weight (kg)' },
        { name: 'Good Morning', weightLabel: 'Weight (kg)' },
    ],
    glutes: [
        { name: 'Hip Thrust', weightLabel: 'Weight (kg)' },
        { name: 'Glute Kickback', weightLabel: 'Weight (kg)' },
        { name: 'Bulgarian Split Squat', weightLabel: 'Weight (kg)' },
        { name: 'Cable Pull-through', weightLabel: 'Weight (kg)' },
        { name: 'Sumo Deadlift', weightLabel: 'Weight (kg)' },
    ],
    core: [
        { name: 'Crunch', weightLabel: 'Weight (kg)' },
        { name: 'Plank', weightLabel: 'Duration (sec)' },
        { name: 'Leg Raise', weightLabel: 'Extra Weight (kg)' },
        { name: 'Cable Crunch', weightLabel: 'Weight (kg)' },
        { name: 'Russian Twist', weightLabel: 'Weight (kg)' },
        { name: 'Ab Wheel Rollout', weightLabel: 'Body Weight' },
        { name: 'Side Plank', weightLabel: 'Duration (sec)' },
        { name: 'Hanging Leg Raise', weightLabel: 'Extra Weight (kg)' },
        { name: 'Woodchop', weightLabel: 'Weight (kg)' },
    ],
    abs: [
        { name: 'Crunch', weightLabel: 'Weight (kg)' },
        { name: 'Plank', weightLabel: 'Duration (sec)' },
        { name: 'Leg Raise', weightLabel: 'Extra Weight (kg)' },
        { name: 'Cable Crunch', weightLabel: 'Weight (kg)' },
        { name: 'Russian Twist', weightLabel: 'Weight (kg)' },
        { name: 'Ab Wheel Rollout', weightLabel: 'Body Weight' },
        { name: 'Sit-up', weightLabel: 'Weight (kg)' },
    ],
    calves: [
        { name: 'Calf Raise', weightLabel: 'Weight (kg)' },
        { name: 'Seated Calf Raise', weightLabel: 'Weight (kg)' },
        { name: 'Donkey Calf Raise', weightLabel: 'Weight (kg)' },
    ],
    forearms: [
        { name: 'Wrist Curl', weightLabel: 'Weight (kg)' },
        { name: 'Reverse Wrist Curl', weightLabel: 'Weight (kg)' },
        { name: 'Farmer Walk', weightLabel: 'Weight (kg)' },
    ],
    traps: [
        { name: 'Shrugs', weightLabel: 'Weight (kg)' },
        { name: 'Barbell Shrug', weightLabel: 'Weight (kg)' },
        { name: 'Face Pull', weightLabel: 'Weight (kg)' },
        { name: 'Upright Row', weightLabel: 'Weight (kg)' },
    ],
};

/**
 * Get suggested movements for a muscle group (case-insensitive).
 * @param {string} muscleGroup
 * @returns {Array<{name: string, weightLabel: string}>}
 */
function getMovementsForMuscleGroup(muscleGroup) {
    if (!muscleGroup) return [];
    const key = muscleGroup.trim().toLowerCase();

    // Direct match
    if (MOVEMENT_DATA[key]) return MOVEMENT_DATA[key];

    // Partial match — find the first key that contains or is contained in the input
    for (const [groupKey, movements] of Object.entries(MOVEMENT_DATA)) {
        if (key.includes(groupKey) || groupKey.includes(key)) {
            return movements;
        }
    }

    return [];
}

/**
 * Get the weight label for a specific movement name (case-insensitive).
 * Falls back to "Weight (kg)" if not found.
 * @param {string} movementName
 * @returns {string}
 */
function getWeightLabel(movementName) {
    if (!movementName) return 'Weight (kg)';
    const name = movementName.trim().toLowerCase();

    for (const movements of Object.values(MOVEMENT_DATA)) {
        for (const m of movements) {
            if (m.name.toLowerCase() === name) {
                return m.weightLabel;
            }
        }
    }

    return 'Weight (kg)';
}

/**
 * Get all available muscle group names.
 * @returns {string[]}
 */
function getAllMuscleGroups() {
    return Object.keys(MOVEMENT_DATA).map(key =>
        key.charAt(0).toUpperCase() + key.slice(1)
    );
}
