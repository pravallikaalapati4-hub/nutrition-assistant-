# Nutrition Assistant App — Backend

Node.js / Express / MongoDB (MERN backend) API for the Nutrition Assistant App: role-based authentication, client management, meal planning, nutrient analysis, and progress tracking.

## Tech Stack
- Node.js + Express.js — REST API and routing
- MongoDB + Mongoose — data storage and modeling
- JWT + bcryptjs — authentication and password hashing
- express-validator — input validation
- helmet, cors, express-rate-limit — security hardening

## Project Structure
```
nutrition-backend/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── clientController.js
│   ├── mealPlanController.js
│   └── progressController.js
├── middleware/
│   ├── auth.js              # JWT protect + role-based authorize
│   ├── errorHandler.js      # centralized error handling + asyncHandler
│   └── validate.js          # express-validator result handler
├── models/
│   ├── User.js
│   ├── Client.js
│   ├── MealPlan.js
│   └── Progress.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── clientRoutes.js
│   ├── mealPlanRoutes.js
│   └── progressRoutes.js
├── utils/
│   └── seed.js              # sample data seeder
├── .env.example
├── package.json
└── server.js
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the environment template and fill in values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI` — local MongoDB or a MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string
   - `CLIENT_URL` — your React frontend origin, for CORS (e.g. `http://localhost:3000`)

3. Start MongoDB locally, or use Atlas.

4. (Optional) Seed sample data — creates an admin, dietitian, user, client profile, meal plan, and progress entry:
   ```
   npm run seed
   ```

5. Run the server:
   ```
   npm run dev     # with nodemon, auto-restart
   npm start        # plain node
   ```

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## Roles
- **user** — a client managing their own nutrition (auto-gets a `Client` profile on registration)
- **dietitian** — manages assigned clients' meal plans; requires no special approval flag to log in, but `isApproved` gates management actions if you choose to enforce it further
- **admin** — full access, approves dietitians, assigns clients, manages all users

## API Overview

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register as `user` or `dietitian` |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Private | Get current user |
| PUT | `/update-password` | Private | Change password |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users (filter by `?role=`) |
| GET | `/:id` | Private | Get a user |
| PUT | `/:id` | Self / Admin | Update profile |
| PUT | `/:id/approve` | Admin | Approve a dietitian |
| PUT | `/:id/deactivate` | Admin | Deactivate a user |

### Clients (`/api/clients`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Dietitian / Admin | Create a client profile |
| GET | `/` | Private | List clients (scoped to role) |
| GET | `/:id` | Self / Dietitian / Admin | Get a client |
| PUT | `/:id` | Dietitian / Admin | Update a client |
| PUT | `/:id/assign` | Admin | Assign a dietitian to a client |
| DELETE | `/:id` | Admin | Delete a client |

### Meal Plans (`/api/mealplans`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Dietitian / Admin | Create a meal plan |
| GET | `/?client=<id>` | Private | List meal plans |
| GET | `/:id` | Private | Get a meal plan |
| PUT | `/:id` | Dietitian / Admin | Update a meal plan |
| DELETE | `/:id` | Dietitian / Admin | Delete a meal plan |
| GET | `/:id/nutrients` | Private | Aggregated nutrient breakdown |

### Progress (`/api/progress`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Private | Log a progress entry |
| GET | `/?client=<id>&from=&to=` | Private | List entries in a date range |
| GET | `/:client/summary` | Private | Aggregated stats for dashboards |
| GET | `/:id` | Private | Get one entry |
| PUT | `/:id` | Private | Update an entry |
| DELETE | `/:id` | Private | Delete an entry |

## Authentication

Send the JWT returned from `/register` or `/login` as a Bearer token:
```
Authorization: Bearer <token>
```

## Connecting the React Frontend

From your React app (using Axios), point requests at `http://localhost:5000/api` and store the returned token (e.g. in memory or an httpOnly-friendly approach) for subsequent authenticated requests.
