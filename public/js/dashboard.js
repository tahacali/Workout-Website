/* ========================================
   Dashboard.js — Dashboard Page Logic
   ======================================== */

async function loadDashboard() {
    try {
        const workouts = await api.get('/api/workouts');

        // Stats
        document.getElementById('statTotalWorkouts').textContent = workouts.length;

        if (workouts.length > 0) {
            document.getElementById('statLastWorkout').textContent = formatDate(workouts[0].Date);

            // Average duration
            const durations = workouts
                .filter(w => w.duration)
                .map(w => {
                    const parts = w.duration.split(':');
                    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
                });
            if (durations.length > 0) {
                const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
                const h = Math.floor(avg / 60);
                const m = avg % 60;
                document.getElementById('statAvgDuration').textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
            } else {
                document.getElementById('statAvgDuration').textContent = '—';
            }
        } else {
            document.getElementById('statLastWorkout').textContent = '—';
            document.getElementById('statAvgDuration').textContent = '—';
        }

        // Total movements
        try {
            const muscleGroups = await api.get('/api/muscle-groups');
            document.getElementById('statTotalMovements').textContent = muscleGroups.length;
        } catch {
            document.getElementById('statTotalMovements').textContent = '—';
        }

        // Recent workouts (last 5)
        const recentContainer = document.getElementById('recentWorkouts');
        const recent = workouts.slice(0, 5);

        if (recent.length === 0) {
            recentContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏋️</div>
          <p>No workouts logged yet</p>
          <a href="#log" class="btn btn-primary" data-page="log">Log Your First Workout</a>
        </div>
      `;
            // Re-attach event listener
            const btn = recentContainer.querySelector('[data-page]');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateTo('log');
                });
            }
            return;
        }

        recentContainer.innerHTML = recent.map(w => `
      <div class="recent-workout-item" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 0;
        border-bottom: 1px solid var(--border-color);
      ">
        <div>
          <span style="font-weight: 600;">${formatDate(w.Date)}</span>
          <div class="workout-muscles" style="margin-top: 4px;">
            ${(w.muscle_groups || '').split(',').map(mg =>
            `<span class="muscle-tag">${mg.trim()}</span>`
        ).join('')}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; color: var(--text-secondary); font-size: 0.85rem;">
          ${w.duration ? `<span>⏱️ ${formatDuration(w.duration)}</span>` : ''}
          ${w.days_since_last_workout != null ? `<span>📅 ${w.days_since_last_workout}d rest</span>` : ''}
        </div>
      </div>
    `).join('');

    } catch (err) {
        console.error('Dashboard error:', err);
        showToast('Failed to load dashboard data', 'error');
    }
}
