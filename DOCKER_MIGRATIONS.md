# Docker-Based Migrations

This project uses a Dockerfile-based approach for running database migrations, providing a consistent and reproducible environment.

## Overview

Instead of running migrations with ad-hoc commands, we use a dedicated Docker image (`Dockerfile.migrate`) that:
- Uses Node.js 20 Alpine for a lightweight image
- Installs all dependencies in a reproducible way
- Installs Bun for running TypeScript seed files
- Generates the Prisma Client
- Runs `prisma migrate deploy` to apply migrations
- Optionally runs database seeds after migrations

## Architecture

```
┌─────────────────────┐
│  Dockerfile.migrate │
│                     │
│  • Node 20 Alpine   │
│  • Bun runtime      │
│  • pnpm             │
│  • Prisma Client    │
│  • All deps         │
│  • Source code      │
└──────────┬──────────┘
           │
           │ builds
           ▼
┌─────────────────────┐
│  Migration Image    │
└──────────┬──────────┘
           │
           │ 1. migrate
           │ 2. seed (optional)
           ▼
┌─────────────────────┐
│  PostgreSQL DB      │
│  (broccoli-postgres)│
└─────────────────────┘
```

## Benefits

### 1. **Consistency**
- Same environment for all developers and CI/CD
- No "works on my machine" issues
- Dependencies are locked and versioned

### 2. **Speed**
- Docker layer caching speeds up subsequent builds
- Only rebuilds when dependencies or schema change
- No need to reinstall packages locally

### 3. **Isolation**
- Migrations run in their own container
- No interference with local Node.js setup
- Clean environment every time

### 4. **Portability**
- Works on any system with Docker
- Easy to integrate into CI/CD pipelines
- No need for local Node.js or pnpm installation

## Usage

### Running Migrations and Seeds

```bash
# Start the database
docker-compose up -d db

# Run migrations AND seeds
docker-compose up migrate

# Run migrations ONLY (skip seeds)
SKIP_SEED=true docker-compose up migrate
```

### After Schema Changes

When you modify `prisma/schema.prisma`:

```bash
# Create a new migration locally
npx prisma migrate dev --name your_migration_name

# Rebuild the migration image
docker-compose build migrate

# Apply the new migration
docker-compose up migrate
```

### Rebuilding the Image

Rebuild when you:
- Update Prisma schema
- Change dependencies
- Update Prisma version

```bash
docker-compose build migrate
```

### Clean Build (No Cache)

```bash
docker-compose build --no-cache migrate
```

## Seeding

### How Seeding Works

The migration image automatically runs seeds after migrations unless `SKIP_SEED=true` is set:

1. Migrations run first via `npx prisma migrate deploy`
2. If successful and `SKIP_SEED != "true"`, seeds run via `bun prisma/seeds/index.ts`
3. If seeding fails, it logs an error but doesn't fail the entire process

### Environment Variables for Seeds

Seeds often require environment variables (auth secrets, API keys, etc.). The docker-compose file loads these from your `.env` file:

```yaml
migrate:
  env_file:
    - .env
  environment:
    DATABASE_URL: postgresql://postgres:postgres@db:5432/broccoli
    SKIP_SEED: ${SKIP_SEED:-false}
```

**Important**: Make sure your `.env` file contains all required variables before running seeds.

### Skipping Seeds

Skip seeds in scenarios where you:
- Only want to apply schema changes
- Don't have all required environment variables
- Are running in production with existing data

```bash
# Skip seeds using environment variable
SKIP_SEED=true docker-compose up migrate

# Or set in .env file
echo "SKIP_SEED=true" >> .env
docker-compose up migrate
```

### Running Seeds Separately

To run only seeds (without migrations):

```bash
# Using bun locally
bun prisma/seeds/index.ts

# Or using pnpm
pnpm db:seed
```

## Dockerfile Structure

```dockerfile
FROM node:20-alpine

# Install system dependencies (OpenSSL for Prisma, Bun for seeding)
RUN apk add --no-cache openssl curl bash

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy dependency files (cached layer)
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies (cached layer)
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy necessary files (Prisma schema + source code for seeds)
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Create entrypoint script that runs migrations and seeds
COPY <<EOF /app/entrypoint.sh
#!/bin/bash
set -e
echo "Running migrations..."
npx prisma migrate deploy
echo "Migrations completed!"

if [ "$SKIP_SEED" != "true" ]; then
  echo "Running seeds..."
  bun prisma/seeds/index.ts || echo "Seeding failed or skipped"
  echo "Seeding completed!"
else
  echo "Skipping seeds (SKIP_SEED=true)"
fi
EOF

RUN chmod +x /app/entrypoint.sh

# Default command
ENTRYPOINT ["/app/entrypoint.sh"]
```

## Layer Caching Strategy

The Dockerfile is structured to maximize Docker's layer caching:

1. **Base image** - Rarely changes
2. **System dependencies** (OpenSSL, curl, bash, bun) - Rarely changes
3. **Package files** - Changes occasionally
4. **Dependencies install** - Only rebuilds if package files change
5. **Source code and Prisma schema** - Changes when you modify database or app code
6. **Prisma generate** - Only runs if schema changes
7. **Entrypoint script** - Rarely changes

This means most builds are fast since only changed layers are rebuilt.

## Integration with docker-compose

```yaml
migrate:
  build:
    context: .
    dockerfile: Dockerfile.migrate
  depends_on:
    db:
      condition: service_healthy
  env_file:
    - .env
  environment:
    DATABASE_URL: postgresql://postgres:postgres@db:5432/broccoli
    SKIP_SEED: ${SKIP_SEED:-false}
  networks:
    - broccoli-network
```

Key features:
- `depends_on` with health check ensures DB is ready
- `env_file` loads environment variables from `.env` for seeds
- `DATABASE_URL` points to the Docker network hostname `db`
- `SKIP_SEED` allows conditional seeding
- Runs in the same network as the database

## .dockerignore

The `.dockerignore` file prevents unnecessary files from being copied into the Docker build context:

```
node_modules/
.next/
.env
public/
worker/
# ... and more

# BUT we keep:
!package.json
!pnpm-lock.yaml
!prisma/**
!tsconfig.json
!src/**
```

**Note**: The migration image DOES include `src/` because seeds import from source code.

This:
- Speeds up builds (less data to transfer)
- Reduces image size where possible
- Prevents sensitive files from being included (but .env is loaded at runtime)

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Run Database Migrations
  run: |
    docker-compose up -d db
    docker-compose build migrate
    docker-compose up migrate

- name: Run Migrations Without Seeds (Production)
  run: |
    docker-compose up -d db
    docker-compose build migrate
    SKIP_SEED=true docker-compose up migrate
```

Example GitLab CI:

```yaml
migrate:
  stage: deploy
  script:
    - docker-compose up -d db
    - docker-compose build migrate
    - SKIP_SEED=true docker-compose up migrate  # Skip seeds in production
```

## Troubleshooting

### Build is Slow

Check if you're invalidating cache layers unnecessarily:
- Ensure `.dockerignore` is properly configured
- Don't modify files that aren't needed for migrations
- Use `--frozen-lockfile` to prevent lock file changes

### "Module not found" Errors

```bash
# Rebuild without cache
docker-compose build --no-cache migrate
```

### Database Connection Failed

```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Ensure network is properly configured
docker network ls | grep broccoli
```

### Prisma Client Out of Sync

If you see "Prisma Client is not in sync" errors:

```bash
# Rebuild the migration image
docker-compose build migrate

# The image will regenerate Prisma Client during build
docker-compose up migrate
```

### Seeding Fails with Environment Variable Errors

If seeds fail due to missing environment variables:

1. **Check your `.env` file** has all required variables
2. **Skip seeds if not needed**: `SKIP_SEED=true docker-compose up migrate`
3. **Run seeds separately** after fixing env vars: `bun prisma/seeds/index.ts`

### Bun Not Found or Installation Issues

If bun installation fails during build:

```bash
# Rebuild without cache
docker-compose build --no-cache migrate

# Check if bun is installed in the image
docker-compose run migrate which bun
```

## Local Development Workflow

For local development, you can still use Prisma CLI directly:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_table

# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

Then rebuild the Docker image for production/CI:

```bash
docker-compose build migrate
```

## Best Practices

1. **Always rebuild after schema changes**
   ```bash
   docker-compose build migrate
   ```

2. **Test migrations before committing**
   ```bash
   docker-compose up migrate
   ```

3. **Keep migrations small and focused**
   - One logical change per migration
   - Test rollback scenarios

4. **Use meaningful migration names**
   ```bash
   npx prisma migrate dev --name add_user_preferences
   ```

5. **Don't edit generated migrations**
   - If you need changes, create a new migration
   - Keep migration history clean

6. **Use SKIP_SEED in production**
   ```bash
   SKIP_SEED=true docker-compose up migrate
   ```
   - Production should not auto-seed
   - Seed only in development/staging

7. **Keep .env file secure**
   - Never commit `.env` to version control
   - Use secrets management in CI/CD
   - Seeds require environment variables at runtime

## Comparison: Before vs After

### Before (Inline Commands)
```yaml
migrate:
  image: node:20
  volumes:
    - ./:/app
  command: |
    npm install -g prisma && npx prisma migrate deploy
    # No seeding capability
```

**Issues:**
- Installs dependencies every time (slow)
- No caching
- Large image with all source code
- Inconsistent environment
- No built-in seeding support

### After (Dockerfile)
```yaml
migrate:
  build:
    context: .
    dockerfile: Dockerfile.migrate
  env_file:
    - .env
  environment:
    SKIP_SEED: ${SKIP_SEED:-false}
```

**Benefits:**
- Cached layers (fast)
- Consistent environment
- Better for CI/CD
- Built-in seeding support
- Configurable via environment variables

## See Also

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Local database setup guide
- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)