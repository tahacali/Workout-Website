/* ========================================
   Workouts.js — Log & History Page Logic
   ======================================== */

let movementCounter = 0;

// ========== Log Workout Form ==========
async function initLogForm() {
  const form = document.getElementById('workoutForm');
  const step1 = document.getElementById('formStep1');
  const step2 = document.getElementById('formStep2');
  const movementsList = document.getElementById('movementsList');

  // Reset form
  form.reset();
  step1.classList.add('active');
  step2.classList.remove('active');
  movementsList.innerHTML = '';
  movementCounter = 0;

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('workoutDate');
  dateInput.value = today;

  // Default duration: 01:00
  document.getElementById('workoutDuration').value = '01:00';

  // Auto-calculate days since last workout from DB
  await updateDaysSince(today);

  // Recalculate when the date changes
  dateInput.addEventListener('change', async () => {
    if (dateInput.value) {
      await updateDaysSince(dateInput.value);
    }
  });

  // Step navigation
  document.getElementById('btnToStep2').onclick = () => {
    const date = document.getElementById('workoutDate').value;
    const muscles = document.getElementById('workoutMuscleGroups').value;
    if (!date || !muscles) {
      showToast('Please fill in date and muscle groups', 'error');
      return;
    }
    step1.classList.remove('active');
    step2.classList.add('active');

    // Auto-add first movement if none exist
    if (movementsList.children.length === 0) {
      addMovementCard();
    }
  };

  document.getElementById('btnBackToStep1').onclick = () => {
    step2.classList.remove('active');
    step1.classList.add('active');
  };

  // Add movement button
  document.getElementById('btnAddMovement').onclick = addMovementCard;

  // Form submit — everything is saved ONLY here, at the end
  form.onsubmit = async (e) => {
    e.preventDefault();
    await submitWorkout();
  };
}

/**
 * Fetch the last workout before the given date and auto-fill the days-since field.
 */
async function updateDaysSince(selectedDate) {
  try {
    const lastData = await api.get(`/api/workouts/last?date=${selectedDate}`);
    const field = document.getElementById('workoutDaysSince');
    if (lastData.daysSince != null) {
      field.value = lastData.daysSince;
    } else {
      field.value = '';
      field.placeholder = 'No previous workout found';
    }
  } catch (err) {
    console.error('Could not auto-fill days since:', err);
  }
}

async function addMovementCard() {
  movementCounter++;
  const container = document.getElementById('movementsList');
  const cardId = movementCounter;

  const card = document.createElement('div');
  card.className = 'movement-card';
  card.id = `movement-${cardId}`;

  // Fetch distinct muscle groups from DB for suggestions
  let muscleGroupOptions = '';
  try {
    const groups = await api.get('/api/muscle-groups/distinct-groups');
    muscleGroupOptions = groups.map(g => `<option value="${g}">`).join('');
  } catch (err) {
    console.error('Could not fetch muscle groups:', err);
  }

  card.innerHTML = `
    <div class="movement-header">
      <h4>Movement #${cardId}</h4>
      <button type="button" class="btn btn-icon btn-ghost" onclick="removeMovement(${cardId})" title="Remove movement">🗑️</button>
    </div>
    <div class="movement-fields">
      <div class="form-group">
        <label>Muscle Group</label>
        <div class="custom-dropdown" id="mgDropdown-${cardId}">
          <input type="text" class="mv-muscle-group dropdown-input" placeholder="Select or type muscle group" autocomplete="off" required>
          <div class="dropdown-list"></div>
        </div>
      </div>
      <div class="form-group">
        <label>Movement Name</label>
        <div class="custom-dropdown" id="mvDropdown-${cardId}">
          <input type="text" class="mv-movement-name dropdown-input" placeholder="Select muscle group first" autocomplete="off" required>
          <div class="dropdown-list"></div>
        </div>
      </div>
      <div class="form-group">
        <label>Number of Sets</label>
        <input type="number" class="mv-set-number" min="1" value="3" required>
      </div>
    </div>
    <h5 style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 600;">Sets Detail</h5>
    <table class="sets-table">
      <thead>
        <tr>
          <th style="width: 60px;">Set</th>
          <th class="weight-col-header">Weight (kg)</th>
          <th>Reps</th>
          <th style="width: 50px;"></th>
        </tr>
      </thead>
      <tbody class="sets-body">
        <tr>
          <td style="text-align: center; font-weight: 600; color: var(--text-muted);">1</td>
          <td><input type="number" class="set-weight" step="0.5" min="0" placeholder="0"></td>
          <td><input type="number" class="set-reps" min="1" placeholder="0"></td>
          <td><button type="button" class="btn btn-icon btn-ghost" onclick="this.closest('tr').remove()" style="font-size: 0.8rem;">✕</button></td>
        </tr>
      </tbody>
    </table>
    <button type="button" class="btn-add-set" onclick="addSetRow(this)">+ Add Set</button>
  `;

  container.appendChild(card);

  // ---- Wire up Muscle Group custom dropdown ----
  const mgDropdown = card.querySelector(`#mgDropdown-${cardId}`);
  const mgInput = mgDropdown.querySelector('.mv-muscle-group');
  const mgList = mgDropdown.querySelector('.dropdown-list');
  let allMuscleGroups = [];
  try {
    allMuscleGroups = await api.get('/api/muscle-groups/distinct-groups');
  } catch (e) { /* ignore */ }

  function renderMgDropdown(filter) {
    const filtered = filter
      ? allMuscleGroups.filter(g => g.toLowerCase().includes(filter.toLowerCase()))
      : allMuscleGroups;
    if (filtered.length === 0) {
      mgList.innerHTML = '<div class="dropdown-item empty">No matches</div>';
    } else {
      mgList.innerHTML = filtered.map(g =>
        `<div class="dropdown-item" data-value="${g}">${g}</div>`
      ).join('');
    }
    mgList.classList.add('open');
  }

  mgInput.addEventListener('focus', () => renderMgDropdown(mgInput.value));
  mgInput.addEventListener('input', () => renderMgDropdown(mgInput.value));

  mgList.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (item && !item.classList.contains('empty')) {
      mgInput.value = item.dataset.value;
      mgList.classList.remove('open');
      // Trigger movement name suggestions
      loadMovementSuggestions(card, cardId, item.dataset.value);
    }
  });

  // Also load movement suggestions when muscle group changes via typing + blur
  mgInput.addEventListener('change', () => {
    loadMovementSuggestions(card, cardId, mgInput.value);
  });

  // ---- Wire up Movement Name custom dropdown ----
  const mvDropdown = card.querySelector(`#mvDropdown-${cardId}`);
  const mvInput = mvDropdown.querySelector('.mv-movement-name');
  const mvList = mvDropdown.querySelector('.dropdown-list');

  // Store suggestions on the card element
  card._movementSuggestions = [];

  function renderMvDropdown(filter) {
    const suggestions = card._movementSuggestions || [];
    const filtered = filter
      ? suggestions.filter(m => m.toLowerCase().includes(filter.toLowerCase()))
      : suggestions;
    if (filtered.length === 0 && suggestions.length > 0) {
      mvList.innerHTML = '<div class="dropdown-item empty">No matches</div>';
    } else if (filtered.length === 0) {
      mvList.innerHTML = '<div class="dropdown-item empty">No previous movements</div>';
    } else {
      mvList.innerHTML = filtered.map(m =>
        `<div class="dropdown-item" data-value="${m}">${m}</div>`
      ).join('');
    }
    mvList.classList.add('open');
  }

  mvInput.addEventListener('focus', () => renderMvDropdown(mvInput.value));
  mvInput.addEventListener('input', () => renderMvDropdown(mvInput.value));

  mvList.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (item && !item.classList.contains('empty')) {
      mvInput.value = item.dataset.value;
      mvList.classList.remove('open');
      updateWeightLabels(card, item.dataset.value);
    }
  });

  // Update weight label when movement name changes
  mvInput.addEventListener('change', () => {
    updateWeightLabels(card, mvInput.value);
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!mgDropdown.contains(e.target)) mgList.classList.remove('open');
    if (!mvDropdown.contains(e.target)) mvList.classList.remove('open');
  });

  // Auto-update set count when sets change
  const setNumberInput = card.querySelector('.mv-set-number');
  setNumberInput.addEventListener('change', () => {
    syncSetsToCount(card, parseInt(setNumberInput.value));
  });
}

/**
 * Fetch movement name suggestions from the DB for the given muscle group.
 */
async function loadMovementSuggestions(card, cardId, muscleGroup) {
  const mvInput = card.querySelector('.mv-movement-name');
  try {
    const movements = await api.get(`/api/muscle-groups/movements?muscle_group=${encodeURIComponent(muscleGroup)}`);
    card._movementSuggestions = movements;
    mvInput.placeholder = movements.length > 0 ? 'Click to see your movements' : 'Type a new movement name';
  } catch (e) {
    card._movementSuggestions = [];
    mvInput.placeholder = 'Type a movement name';
  }
}

/**
 * Update the weight column header and placeholders based on the selected movement.
 */
function updateWeightLabels(card, movementName) {
  const label = getWeightLabel(movementName);
  const header = card.querySelector('.weight-col-header');
  if (header) header.textContent = label;

  const weightInputs = card.querySelectorAll('.set-weight');
  let placeholder = '0';
  if (label === 'Body Weight') placeholder = 'BW';
  else if (label === 'Duration (sec)') placeholder = 'seconds';
  else if (label === 'Assist Level') placeholder = 'level';

  weightInputs.forEach(input => { input.placeholder = placeholder; });
}

function addSetRow(btn) {
  const tbody = btn.previousElementSibling.querySelector('.sets-body');
  const count = tbody.querySelectorAll('tr').length + 1;
  const card = btn.closest('.movement-card');

  const movementName = card.querySelector('.mv-movement-name').value;
  const label = getWeightLabel(movementName);
  let placeholder = '0';
  if (label === 'Body Weight') placeholder = 'BW';
  else if (label === 'Duration (sec)') placeholder = 'seconds';
  else if (label === 'Assist Level') placeholder = 'level';

  const row = document.createElement('tr');
  row.innerHTML = `
    <td style="text-align: center; font-weight: 600; color: var(--text-muted);">${count}</td>
    <td><input type="number" class="set-weight" step="0.5" min="0" placeholder="${placeholder}"></td>
    <td><input type="number" class="set-reps" min="1" placeholder="0"></td>
    <td><button type="button" class="btn btn-icon btn-ghost" onclick="removeSetRow(this)" style="font-size: 0.8rem;">✕</button></td>
  `;
  tbody.appendChild(row);
  card.querySelector('.mv-set-number').value = count;
}

function removeSetRow(btn) {
  const tbody = btn.closest('tbody');
  btn.closest('tr').remove();
  tbody.querySelectorAll('tr').forEach((row, i) => {
    row.querySelector('td').textContent = i + 1;
  });
  const card = tbody.closest('.movement-card');
  card.querySelector('.mv-set-number').value = tbody.querySelectorAll('tr').length;
}

function syncSetsToCount(card, count) {
  const tbody = card.querySelector('.sets-body');
  const current = tbody.querySelectorAll('tr').length;

  const movementName = card.querySelector('.mv-movement-name').value;
  const label = getWeightLabel(movementName);
  let placeholder = '0';
  if (label === 'Body Weight') placeholder = 'BW';
  else if (label === 'Duration (sec)') placeholder = 'seconds';
  else if (label === 'Assist Level') placeholder = 'level';

  if (count > current) {
    for (let i = current + 1; i <= count; i++) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="text-align: center; font-weight: 600; color: var(--text-muted);">${i}</td>
        <td><input type="number" class="set-weight" step="0.5" min="0" placeholder="${placeholder}"></td>
        <td><input type="number" class="set-reps" min="1" placeholder="0"></td>
        <td><button type="button" class="btn btn-icon btn-ghost" onclick="removeSetRow(this)" style="font-size: 0.8rem;">✕</button></td>
      `;
      tbody.appendChild(row);
    }
  } else if (count < current) {
    const rows = tbody.querySelectorAll('tr');
    for (let i = current - 1; i >= count; i--) {
      rows[i].remove();
    }
  }
}

function removeMovement(id) {
  const card = document.getElementById(`movement-${id}`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateX(-20px)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => card.remove(), 300);
  }
}

/**
 * Submit the entire workout in one single API call.
 * Nothing is saved to the database until this runs.
 */
async function submitWorkout() {
  const submitBtn = document.getElementById('btnSubmitWorkout');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Saving...';

  try {
    const workoutDate = document.getElementById('workoutDate').value;
    const muscleGroupsStr = document.getElementById('workoutMuscleGroups').value;
    const daysSince = document.getElementById('workoutDaysSince').value;
    let duration = document.getElementById('workoutDuration').value;

    // Default duration to 01:00 if empty
    if (!duration) duration = '01:00';

    // Collect movements & sets
    const movements = [];
    document.querySelectorAll('.movement-card').forEach(card => {
      const muscleGroup = card.querySelector('.mv-muscle-group').value;
      const movementName = card.querySelector('.mv-movement-name').value;
      const setNumber = parseInt(card.querySelector('.mv-set-number').value);

      const sets = [];
      card.querySelectorAll('.sets-body tr').forEach(row => {
        const weight = parseFloat(row.querySelector('.set-weight').value) || 0;
        const reps = parseInt(row.querySelector('.set-reps').value) || 0;
        sets.push({ weight, reps });
      });

      movements.push({
        muscle_group: muscleGroup,
        movement_name: movementName,
        set_number: setNumber,
        sets
      });
    });

    const data = {
      Date: workoutDate,
      muscle_groups: muscleGroupsStr,
      days_since_last_workout: daysSince ? parseInt(daysSince) : null,
      duration: duration || null,
      muscleGroups: movements
    };

    await api.post('/api/workouts', data);
    showToast('Workout saved successfully! 💪', 'success');
    setTimeout(() => navigateTo('dashboard'), 500);
  } catch (err) {
    console.error('Submit error:', err);
    showToast(err.message || 'Failed to save workout', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '💾 Save Workout';
  }
}

// ========== History Page ==========
async function loadHistory() {
  const container = document.getElementById('historyList');
  container.innerHTML = '<div class="loading-text">Loading workouts...</div>';

  try {
    const workouts = await api.get('/api/workouts');

    if (workouts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No workout history yet</p>
          <a href="#log" class="btn btn-primary" data-page="log">Log Your First Workout</a>
        </div>
      `;
      const btn = container.querySelector('[data-page]');
      if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); navigateTo('log'); });
      return;
    }

    container.innerHTML = workouts.map(w => `
      <div class="workout-card" id="workout-card-${w.workout_id}">
        <div class="workout-card-header" onclick="toggleWorkoutDetail(${w.workout_id})">
          <div class="workout-card-info">
            <span class="workout-date">${formatDate(w.Date)}</span>
            <div class="workout-muscles">
              ${(w.muscle_groups || '').split(',').map(mg =>
      `<span class="muscle-tag">${mg.trim()}</span>`
    ).join('')}
            </div>
          </div>
          <div class="workout-meta">
            ${w.duration ? `<span>⏱️ ${formatDuration(w.duration)}</span>` : ''}
            ${w.days_since_last_workout != null ? `<span>📅 ${w.days_since_last_workout}d rest</span>` : ''}
            <div class="workout-card-actions">
              <button class="btn btn-icon btn-ghost" onclick="event.stopPropagation(); openEditWorkout(${w.workout_id})" title="Edit">✏️</button>
              <button class="btn btn-icon btn-ghost" onclick="event.stopPropagation(); confirmDeleteWorkout(${w.workout_id})" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
        <div class="workout-card-detail" id="detail-${w.workout_id}">
          <div class="loading-text" style="padding: 20px;">Loading details...</div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('History error:', err);
    container.innerHTML = '<div class="loading-text">Failed to load workouts</div>';
    showToast('Failed to load history', 'error');
  }
}

async function toggleWorkoutDetail(workoutId) {
  const detail = document.getElementById(`detail-${workoutId}`);
  const isOpen = detail.classList.contains('open');

  if (isOpen) {
    detail.classList.remove('open');
    return;
  }

  detail.classList.add('open');

  try {
    const workout = await api.get(`/api/workouts/${workoutId}`);
    const muscleGroups = workout.muscleGroups || [];

    if (muscleGroups.length === 0) {
      detail.innerHTML = '<p style="padding: 20px; color: var(--text-muted);">No movements recorded for this workout.</p>';
      return;
    }

    detail.innerHTML = muscleGroups.map(mg => {
      const unit = getWeightUnit(mg.movement_name);
      return `
        <div class="detail-movement">
          <h4>
            <span style="color: var(--accent-primary);">●</span>
            ${mg.muscle_group} — ${mg.movement_name}
            <span style="color: var(--text-muted); font-weight: 400; font-size: 0.82rem;">(${mg.set_number} sets)</span>
          </h4>
          <div class="detail-sets">
            ${(mg.sets || []).map((s, i) => `
              <div class="detail-set">
                <div class="set-label">Set ${i + 1}</div>
                <div class="set-value">${s.weight}${unit ? ' ' + unit : ''} × ${s.movement} reps</div>
              </div>
            `).join('') || '<span style="color: var(--text-muted); font-size: 0.85rem;">No set details</span>'}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    detail.innerHTML = '<p style="padding: 20px; color: var(--accent-danger);">Failed to load details</p>';
  }
}

// ========== Edit Workout ==========
async function openEditWorkout(workoutId) {
  const modal = document.getElementById('editModal');
  const title = document.getElementById('editModalTitle');
  const body = document.getElementById('editModalBody');

  title.textContent = 'Edit Workout';

  try {
    const workout = await api.get(`/api/workouts/${workoutId}`);

    const dateVal = workout.Date ? workout.Date.split('T')[0] : '';
    // Format duration to HH:MM
    let durationVal = workout.duration || '';
    if (durationVal && durationVal.split(':').length > 2) {
      durationVal = durationVal.split(':').slice(0, 2).join(':');
    }

    body.innerHTML = `
      <form id="editWorkoutForm">
        <div class="form-grid">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="editDate" value="${dateVal}" required>
          </div>
          <div class="form-group">
            <label>Muscle Groups</label>
            <input type="text" id="editMuscleGroups" value="${workout.muscle_groups || ''}" required>
          </div>
          <div class="form-group">
            <label>Days Since Last Workout</label>
            <input type="number" id="editDaysSince" value="${workout.days_since_last_workout || ''}" min="0">
          </div>
          <div class="form-group">
            <label>Duration (HH:MM)</label>
            <input type="text" id="editDuration" value="${durationVal}" placeholder="01:00" pattern="[0-9]{1,2}:[0-9]{2}">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="document.getElementById('editModal').classList.remove('open')">Cancel</button>
          <button type="submit" class="btn btn-primary">💾 Save Changes</button>
        </div>
      </form>
    `;

    document.getElementById('editWorkoutForm').onsubmit = async (e) => {
      e.preventDefault();

      try {
        await api.put(`/api/workouts/${workoutId}`, {
          Date: document.getElementById('editDate').value,
          muscle_groups: document.getElementById('editMuscleGroups').value,
          days_since_last_workout: document.getElementById('editDaysSince').value ? parseInt(document.getElementById('editDaysSince').value) : null,
          duration: document.getElementById('editDuration').value || '01:00'
        });

        modal.classList.remove('open');
        showToast('Workout updated! ✅', 'success');
        loadHistory();
      } catch (err) {
        showToast(err.message || 'Failed to update workout', 'error');
      }
    };

    modal.classList.add('open');
  } catch (err) {
    showToast('Failed to load workout data', 'error');
  }
}

// ========== Delete Workout ==========
function confirmDeleteWorkout(workoutId) {
  const modal = document.getElementById('deleteModal');
  document.getElementById('deleteModalText').textContent =
    'Are you sure you want to delete this workout? All associated movements and sets will also be deleted. This cannot be undone.';

  document.getElementById('deleteModalConfirm').onclick = async () => {
    try {
      await api.delete(`/api/workouts/${workoutId}`);
      modal.classList.remove('open');
      showToast('Workout deleted', 'success');
      loadHistory();
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to delete workout', 'error');
    }
  };

  modal.classList.add('open');
}
