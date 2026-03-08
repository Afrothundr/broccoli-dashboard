# Database Setup Guide

## Local Docker Setup

This project uses PostgreSQL 16 running in Docker for local development.

## Starting the Database

To start the PostgreSQL database locally:

```bash
docker-compose up -d db
```

This will:
- Start PostgreSQL on port `5432`
- Create a database named `broccoli`
- Set up user `postgres` with password `postgres`

## Connecting from Your Local Machine

### Connection Details

- **Host:** `localhost` (or `127.0.0.1`)
- **Port:** `5432`
- **Database:** `broccoli`
- **Username:** `postgres`
- **Password:** `postgres`

### Connection String

For your `.env` file (local development):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/broccoli"
```

### Using Database Clients

#### TablePlus / Postico / pgAdmin
- Host: `localhost`
- Port: `5432`
- Database: `broccoli`
- Username: `postgres`
- Password: `postgres`

#### psql (Command Line)
```bash
psql -h localhost -p 5432 -U postgres -d broccoli
```

When prompted, enter password: `postgres`

## Running Migrations and Seeds

The project uses a Dockerfile (`Dockerfile.migrate`) for running migrations and seeds, which ensures a consistent environment.

To run Prisma migrations and seeds:

```bash
# Make sure the database is running first
docker-compose up -d db

# Build and run migrations + seeds using the migrate service
docker-compose up migrate

# Run migrations ONLY (skip seeds)
SKIP_SEED=true docker-compose up migrate

# Or run migrations locally (requires Node.js and dependencies installed)
npx prisma migrate deploy

# Run seeds locally
bun prisma/seeds/index.ts
# or
pnpm db:seed
```

### Migrate Service Details

The migrate service:
- Uses `Dockerfile.migrate` for a consistent, cached build
- Waits for the database to be healthy before running
- Runs `prisma migrate deploy` to apply pending migrations
- Automatically runs database seeds after migrations (unless `SKIP_SEED=true`)
- Loads environment variables from `.env` file for seeding
- Automatically includes all dependencies, Bun runtime, and Prisma Client generation

### About Seeds

Seeds populate your database with initial data. By default, seeds run automatically after migrations. However:

- **Development**: Seeds are useful for setting up test users and data
- **Production**: Use `SKIP_SEED=true` to prevent auto-seeding
- **Missing Env Vars**: If seeds fail due to missing environment variables, they'll be skipped with a warning

```bash
# Skip seeds if you don't have all environment variables
SKIP_SEED=true docker-compose up migrate
```

## Database Management Commands

```bash
# Start database
docker-compose up -d db

# Stop database
docker-compose stop db

# Stop and remove database (WARNING: deletes data)
docker-compose down

# Stop and remove database WITH volumes (WARNING: complete data wipe)
docker-compose down -v

# View database logs
docker-compose logs -f db

# View migration logs
docker-compose logs -f migrate

# Check database health
docker-compose ps

# Rebuild migration image (after Prisma schema or seed changes)
docker-compose build migrate

# Run seeds separately (locally)
bun prisma/seeds/index.ts
# or
pnpm db:seed
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use, you have a few options:

1. **Stop the existing PostgreSQL service:**
   ```bash
   # On macOS
   brew services stop postgresql
   
   # On Linux
   sudo systemctl stop postgresql
   ```

2. **Change the port in docker-compose.yml:**
   ```yaml
   ports:
     - "5433:5432"  # Use port 5433 on host instead
   ```
   
   Then update your connection string:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/broccoli"
   ```

### Can't Connect from Local Machine

1. **Ensure the container is running:**
   ```bash
   docker-compose ps
   ```

2. **Check the container logs:**
   ```bash
   docker-compose logs db
   ```

3. **Verify the port is exposed:**
   ```bash
   docker ps | grep postgres
   ```

4. **Test the connection:**
   ```bash
   pg_isready -h localhost -p 5432 -U postgres
   ```

### Database Not Ready

The database needs a few seconds to initialize on first start. The docker-compose file includes a health check that waits for the database to be ready before running migrations.

If you're having timing issues, wait 10-15 seconds after starting the container before connecting.

## Resetting the Database

To completely reset your local database:

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh and run migrations + seeds
docker-compose up -d db
docker-compose up migrate

# Or run without seeds
docker-compose up -d db
SKIP_SEED=true docker-compose up migrate
bun prisma/seeds/index.ts  # Run seeds manually after
```

## Updating the Migration Image

After making changes to your Prisma schema, seed files, or dependencies:

```bash
# Rebuild the migration image
docker-compose build migrate

# Run the updated migrations and seeds
docker-compose up migrate

# Or run migrations only
SKIP_SEED=true docker-compose up migrate
```

## Troubleshooting Seeds

### Seeds Fail with Environment Variable Errors

If you see errors about missing environment variables when seeding:

1. Make sure your `.env` file exists and contains all required variables
2. Run migrations without seeds: `SKIP_SEED=true docker-compose up migrate`
3. Run seeds separately after fixing env vars: `bun prisma/seeds/index.ts`

### Skipping Seeds in Production

For production deployments, always skip auto-seeding:

```bash
SKIP_SEED=true docker-compose up migrate
```

Or set in your `.env` file:
```
SKIP_SEED=true
```

## Prisma Studio

To view and edit your database using Prisma Studio:

```bash
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can browse and modify your data.