# Quick Start - 5 Minutes Setup

## For Local Development in VS Code

### Step 1: Install PostgreSQL
Download from: https://www.postgresql.org/download/

After installation, open terminal and verify:
```bash
psql --version
```

### Step 2: Create Local Database
Open PostgreSQL Command Prompt and run:
```sql
CREATE DATABASE dcms_local;
CREATE USER dcms_user WITH PASSWORD 'dcms_password_123';
GRANT ALL PRIVILEGES ON DATABASE dcms_local TO dcms_user;
```

Or run this in regular terminal:
```bash
createdb dcms_local
createuser dcms_user
```

### Step 3: Clone & Setup Project
```bash
# Navigate to your projects folder
cd your-projects-folder

# Copy project here (if not already there)
# Then go into the project
cd project-folder

# Install dependencies
npm install
```

### Step 4: Create `.env.local` File
In project root, create file `.env.local`:
```
DATABASE_URL="postgresql://dcms_user:dcms_password_123@localhost:5432/dcms_local"
SESSION_SECRET="dev-secret-key-here-use-any-random-string-32-chars"
NODE_ENV="development"
```

### Step 5: Initialize Database
```bash
npm run db:push
```

### Step 6: Run the Project
```bash
npm run dev
```

Open browser: **http://localhost:5000**

### Step 7: Login
- **Username:** admin
- **Password:** admin123

---

## Testing Other Roles
- **Donor:** username=donor1, password=donor123
- **Volunteer:** username=volunteer1, password=volunteer123

---

## If Something Goes Wrong

**Error: "Cannot connect to database"**
- ✅ Check PostgreSQL is running
- ✅ Verify DATABASE_URL in .env.local is correct
- ✅ Test: `psql "postgresql://dcms_user:dcms_password_123@localhost:5432/dcms_local"`

**Error: "Port 5000 already in use"**
```bash
# Kill process
lsof -i :5000 | grep node | awk '{print $2}' | xargs kill -9
npm run dev
```

**Error: "Missing modules"**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Reset Database**
```bash
# Drop and recreate (careful!)
psql -U dcms_user -d dcms_local -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
npm run dev
```

---

## Done! 🎉
Your DCMS is running locally with your PostgreSQL database.

For full setup guide, see: **LOCAL_SETUP_GUIDE.md**
