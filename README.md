# AVG Orphanage - Node.js Express Backend

This directory contains the Node.js + Express backend powered by Sequelize ORM for connecting to a MySQL database.

## Folder Structure
- `src/config/`: Connection setup for Sequelize (`database.js`).
- `src/models/`: Sequelize schemas representing database tables.
- `src/middleware/`: Express middleware including JWT auth and Multer uploads.
- `src/controllers/`: Controllers for Auth, CRUD queries, and File Uploads.
- `src/routes/`: Route definitions for the REST API.
- `src/scripts/`: Script to seed initial database schemas and defaults.
- `public/uploads/`: Folder where uploaded images are saved statically.

## Setup Instructions

### 1. Database Setup
Ensure that your MySQL server is running (e.g. via Ubuntu/WSL, XAMPP, Docker, etc. on port 3306). 
You can choose to set up the database in one of two ways:

#### Option A: Automatic Seeding (Recommended)
You can run the automatic seeding script. It will connect to your MySQL instance, automatically create the `orphanage` database if it doesn't exist, build all required tables, and insert default content (including default admin credentials):
```bash
npm run seed
```

#### Option B: Manual Import (phpMyAdmin)
1. Open phpMyAdmin.
2. Create a new database named `orphanage`.
3. Import the SQL schema file located at `backend/orphanage.sql`.

---

### 2. Configure Environment Variables
Copy or modify the `.env` file at the root of the `backend/` directory:
```dotenv
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=orphanage
JWT_SECRET=avg_orphanage_secure_jwt_secret_key_1919
```
*Modify `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` to match your MySQL connection parameters.*

---

### 3. Start the Server
To install backend dependencies and start the local development server:
```bash
# Install packages
npm install

# Start in development mode (reloads automatically on save)
npm run dev

# Or start in production mode
npm start
```
The server will start on `http://localhost:5000`.

---

### 4. Admin Credentials
The database seeder/SQL script populates a default admin account:
- **Email**: `admin@orphanage.org`
- **Password**: `admin123`
You can use these credentials to log into the admin panel on the website and start managing content!
