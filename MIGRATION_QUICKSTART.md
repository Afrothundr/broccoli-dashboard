# Migration & Seeding Quick Start

Quick reference for running database migrations and seeds with Docker.

## 🚀 Basic Usage

```bash
# Start database + run migrations + run seeds
docker-compose up -d db
docker-compose up migrate

# Start database + run migrations ONLY (no seeds)
docker-compose up -d db
SKIP_SEED=true docker-compose up migrate
```

## 📋 Common Commands

### Database Management
```bash
# Start database
docker-compose up -d db

# Stop database
docker-compose stop db

# View database logs
docker-compose logs -f db

# Check database status
docker-compose ps
```

### Migrations
```bash
# Run migrations + seeds
docker-compose up migrate

# Run migrations without seeds
SKIP_SEED=true docker-compose up migrate

# Rebuild migration image (after schema changes)
docker-compose build migrate

# View migration logs
docker-compose logs migrate
```

### Seeds
```bash
# Seeds run automatically with migrations (unless SKIP_SEED=true)

# Run seeds manually (local)
bun prisma/seeds/index.ts
# or
pnpm db:seed

# Skip seeds
SKIP_SEED=true docker-compose up migrate
```

### Local Development
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Stop existing PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql # Linux

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use different port
```

### Seeds Fail with Environment Errors
```bash
# Option 1: Skip seeds
SKIP_SEED=true docker-compose up migrate

# Option 2: Fix .env and run seeds manually
bun prisma/seeds/index.ts
```

### Rebuild Without Cache
```bash
docker-compose build --no-cache migrate
```

### Complete Reset (⚠️ DELETES ALL DATA)
```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d db
docker-compose up migrate
```

## 🔌 Database Connection

- **Host:** `localhost`
- **Port:** `8008` (or `5432` - check docker-compose.yml)
- **Database:** `broccoli`
- **Username:** `postgres`
- **Password:** `postgres`

**Connection String:**
```
postgresql://postgres:postgres@localhost:8008/broccoli
```

## 📝 Environment Variables

### Required for Seeding
Make sure your `.env` file exists with all required variables. If seeds fail:
1. Check `.env` file exists
2. Use `SKIP_SEED=true` to bypass seeding
3. Run seeds manually after fixing env vars

### Control Seeding
```bash
# In .env file
SKIP_SEED=true  # Always skip seeds

# Or via command line
SKIP_SEED=true docker-compose up migrate
```

## 📚 More Information

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup guide
- **[DOCKER_MIGRATIONS.md](./DOCKER_MIGRATIONS.md)** - Detailed migration architecture and best practices

## 🎯 Typical Workflows

### First Time Setup
```bash
docker-compose up -d db
docker-compose build migrate
docker-compose up migrate
```

### After Schema Changes
```bash
# Create migration locally
npx prisma migrate dev --name your_change

# Rebuild and run
docker-compose build migrate
docker-compose up migrate
```

### Production Deployment
```bash
docker-compose up -d db
docker-compose build migrate
SKIP_SEED=true docker-compose up migrate  # Never seed production!
```

### Development Reset
```bash
docker-compose down -v
docker-compose up -d db
docker-compose up migrate
```
