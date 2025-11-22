# Local Setup Guide - DCMS (Donation & Charity Management System)

This guide helps you run the project locally in VS Code with your own PostgreSQL database.

## Prerequisites

Install these before starting:
- **Node.js** (v18+): https://nodejs.org/
- **PostgreSQL** (v12+): https://www.postgresql.org/download/
- **VS Code**: https://code.visualstudio.com/
- **Git**: https://git-scm.com/

## Step 1: Get the Project

```bash
# Clone the repository (if using Git)
git clone <your-repo-url>
cd <project-directory>

# Or extract the project folder if downloaded as ZIP
```

## Step 2: Install Dependencies

```bash
# In the project root directory
npm install
```

## Step 3: Create Local PostgreSQL Database

Open **PostgreSQL Command Line** or **pgAdmin**:

```sql
-- Create database
CREATE DATABASE dcms_local;

-- Create user (optional but recommended)
CREATE USER dcms_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dcms_local TO dcms_user;
```

Or using PostgreSQL command line:
```bash
createdb dcms_local
createuser dcms_user
psql -d dcms_local -c "ALTER USER dcms_user WITH PASSWORD 'your_secure_password';"
psql -d dcms_local -c "GRANT ALL PRIVILEGES ON DATABASE dcms_local TO dcms_user;"
```

## Step 4: Configure Environment Variables

Create a `.env.local` file in the project **root directory**:

```bash
# Database Configuration
DATABASE_URL="postgresql://dcms_user:your_secure_password@localhost:5432/dcms_local"

# Session Secret (use any random string)
SESSION_SECRET="your-random-secret-key-min-32-characters-long"

# Optional: Node Environment
NODE_ENV="development"
```

**Example `.env.local` file:**
```
DATABASE_URL="postgresql://dcms_user:mypassword123@localhost:5432/dcms_local"
SESSION_SECRET="super-secret-key-for-session-encryption-32chars"
NODE_ENV="development"
```

## Step 5: Initialize Database Schema

The project uses **Drizzle ORM** with automatic migrations.

```bash
# Push schema to your local database
npm run db:push

# Or force push if you have schema conflicts
npm run db:push -- --force
```

This command:
- Creates all required tables (users, campaigns, donations, events, etc.)
- Sets up indexes and constraints
- Runs migrations automatically

## Step 6: Seed Sample Data (Optional)

To populate the database with test data:

```bash
npx tsx server/seed.ts
```

This creates:
- Admin user: `username=admin, password=admin123`
- Donor users: `username=donor1, password=donor123`
- Volunteer user: `username=volunteer1, password=volunteer123`
- Sample campaigns, donations, and events

## Step 7: Run the Application

```bash
# Start both backend and frontend
npm run dev
```

The application will start on: **http://localhost:5000**

## Step 8: Open in Browser

1. Navigate to `http://localhost:5000`
2. Login with test credentials:
   - **Admin**: username=`admin`, password=`admin123`
   - **Donor**: username=`donor1`, password=`donor123`
   - **Volunteer**: username=`volunteer1`, password=`volunteer123`

---

## Project Structure

```
project-root/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # Reusable components
│       └── lib/          # Utilities and API client
├── server/                # Express backend
│   ├── index-dev.ts      # Development entry point
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database operations
│   └── middleware/       # Authentication, etc.
├── shared/               # Shared code
│   └── schema.ts        # Data models & validation
├── .env.local           # Your local environment variables
├── package.json         # Dependencies
├── drizzle.config.ts    # Database configuration
└── vite.config.ts       # Frontend build config
```

## Configuration Files Explained

### `drizzle.config.ts`
Tells Drizzle where your database is located. It reads from `DATABASE_URL`:
```typescript
// Already configured to use DATABASE_URL from .env.local
// No changes needed!
```

### `.env.local` (Create this file)
Your local environment variables. **DO NOT commit this file to Git**:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SESSION_SECRET=your-secret
```

### `vite.config.ts`
Frontend build configuration. Already set up for local development:
```typescript
// Already configured
// No changes needed - runs on http://localhost:5000
```

### `server/index-dev.ts`
Entry point for development. Already set to port 5000:
```typescript
// Already configured
// No changes needed!
```

---

## Common Issues & Solutions

### Issue: "Cannot find module 'pg'"
```bash
npm install
npm run dev
```

### Issue: "Database connection refused"
1. Check PostgreSQL is running: `sudo systemctl start postgresql` (Linux/Mac)
2. Verify `DATABASE_URL` in `.env.local` is correct
3. Test connection:
   ```bash
   psql "postgresql://dcms_user:password@localhost:5432/dcms_local"
   ```

### Issue: "Port 5000 already in use"
```bash
# Find and kill process using port 5000
# Linux/Mac
lsof -i :5000 | grep LISTEN
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "Unexpected token import"
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Schema doesn't match after updating code
```bash
npm run db:push -- --force
```

---

## Development Workflow

### 1. Start the Application
```bash
npm run dev
```
- Backend runs on `http://localhost:5000/api/`
- Frontend runs on `http://localhost:5000/`

### 2. Make Code Changes
- Edit React components in `client/src/`
- Edit API routes in `server/routes.ts`
- Changes auto-reload (HMR enabled)

### 3. Update Database Schema
Edit `shared/schema.ts`:
```typescript
// Example: Add new column
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  newField: text('new_field'), // Add this
});
```

Then sync to database:
```bash
npm run db:push
```

### 4. Create API Endpoints
Add route in `server/routes.ts`:
```typescript
app.post('/api/new-endpoint', authenticateToken, async (req, res) => {
  // Your logic here
});
```

---

## Debugging in VS Code

### Debug Backend with VS Code
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "server/index-dev.ts"],
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

Then press `F5` to start debugging.

### View Logs
- Terminal shows server logs
- Browser DevTools (F12) shows frontend logs
- Database queries: Check server terminal output

---

## Next Steps

1. ✅ Run `npm install`
2. ✅ Create `.env.local` with DATABASE_URL
3. ✅ Create PostgreSQL database
4. ✅ Run `npm run db:push`
5. ✅ Run `npm run dev`
6. ✅ Open `http://localhost:5000` and login

You're all set! 🎉

---

## Production Deployment (Later)

When ready to deploy:
- Use a managed PostgreSQL (AWS RDS, Azure Database, etc.)
- Update `DATABASE_URL` environment variable
- Run `npm run build && npm run prod`

