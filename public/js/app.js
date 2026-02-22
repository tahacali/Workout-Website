/* ========================================
   App.js — SPA Routing & API Helpers
   ======================================== */

const API_BASE = '';

// ========== API Service ==========
const api = {
    async get(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || 'Request failed');
        }
        return res.json();
    },

    async post(endpoint, data) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || 'Request failed');
        }
        return res.json();
    },

    async put(endpoint, data) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || 'Request failed');
        }
        return res.json();
    },

    async delete(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || 'Request failed');
        }
        return res.json();
    }
};

// ========== Toast Notifications ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ========== SPA Router ==========
function navigateTo(page) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Trigger page load
    if (page === 'dashboard') loadDashboard();
    if (page === 'history') loadHistory();
    if (page === 'log') initLogForm();
}

// ========== Event Listeners ==========
document.addEventListener('DOMContentLoaded', () => {
    // Nav link clicks
    document.querySelectorAll('.nav-link, [data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                window.location.hash = page;
                navigateTo(page);
            }
        });
    });

    // Hash-based routing
    window.addEventListener('hashchange', () => {
        const page = window.location.hash.slice(1) || 'dashboard';
        navigateTo(page);
    });

    // Mobile hamburger
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
    });

    // Modal close handlers
    document.getElementById('editModalClose').addEventListener('click', () => {
        document.getElementById('editModal').classList.remove('open');
    });
    document.getElementById('deleteModalClose').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.remove('open');
    });
    document.getElementById('deleteModalCancel').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.remove('open');
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    // Initial route
    const initialPage = window.location.hash.slice(1) || 'dashboard';
    navigateTo(initialPage);
});

// ========== Utility ==========
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDuration(timeStr) {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
        const h = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }
    return timeStr;
}
