# 🏋️ Sport Log

A personal workout tracking web application that connects to a MySQL database for logging workouts, muscle groups, movements, and sets.

## Features

- **Log Workouts** — Record workout date, targeted muscle groups, duration, and rest days
- **Track Movements** — Add specific exercises per muscle group with set counts
- **Track Sets** — Log weight and reps for each set
- **Full CRUD** — Create, Read, Update, and Delete all records
- **Dashboard** — Quick overview of your recent workout activity
- **History** — Browse and manage past workouts

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | MySQL 8 |
| Frontend | Vanilla HTML, CSS, JavaScript |

## Database Schema

```
workout (1) ──→ (N) muscle_groups (1) ──→ (N) set_information
```

- **workout** — Date, targeted muscle groups, days since last workout, duration
- **muscle_groups** — Muscle group, movement name, set count (linked to a workout date)
- **set_information** — Weight and reps per set (linked to a muscle group entry)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- MySQL 8 with the `workout` database already set up

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sport-log
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=workout
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
sport-log/
├── public/               # Frontend (served as static files)
│   ├── index.html        # Main HTML shell
│   ├── css/
│   │   └── styles.css    # Global styles
│   └── js/
│       ├── app.js        # SPA routing & API helpers
│       ├── dashboard.js  # Dashboard page logic
│       └── workouts.js   # Workout CRUD page logic
├── routes/               # Express API route handlers
│   ├── workouts.js       # /api/workouts endpoints
│   ├── muscle-groups.js  # /api/muscle-groups endpoints
│   └── sets.js           # /api/sets endpoints
├── server.js             # Express server entry point
├── .env.example          # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Workouts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workouts` | List all workouts |
| GET | `/api/workouts/:id` | Get workout with details |
| POST | `/api/workouts` | Create new workout |
| PUT | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout (cascades) |

### Muscle Groups
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/muscle-groups?date=` | List by workout date |
| POST | `/api/muscle-groups` | Add muscle group entry |
| PUT | `/api/muscle-groups/:id` | Update entry |
| DELETE | `/api/muscle-groups/:id` | Delete entry |

### Sets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sets?muscle_group_id=` | List sets for a muscle group |
| POST | `/api/sets` | Add set |
| PUT | `/api/sets/:id` | Update set |
| DELETE | `/api/sets/:id` | Delete set |

## Future Plans

- 📊 Statistical analysis & charts for tracking progress per movement
- 📈 Personal records (PR) tracking
- 🏆 Workout streaks & consistency metrics

## License

ISC
