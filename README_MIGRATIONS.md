# Database Migrations & Seeding Guide

Complete guide for managing database migrations and seeds in the Broccoli Dashboard project.

## 📚 Documentation

This project has comprehensive documentation for database management:

- **[MIGRATION_QUICKSTART.md](./MIGRATION_QUICKSTART.md)** - Quick reference for common commands ⚡
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup and connection guide 🔌
- **[DOCKER_MIGRATIONS.md](./DOCKER_MIGRATIONS.md)** - Deep dive into migration architecture 🏗️

## 🚀 Quick Start

```bash
# 1. Start the database
docker-compose up -d db

# 2. Run migrations and seeds
docker-compose up migrate

# 3. Connect to your database
# Host: localhost, Port: 8008, Database: broccoli
# User: postgres, Password: postgres
```

## 📦 What's Included

### Dockerized Migration System

This project uses a Dockerfile-based approach for migrations:

- ✅ **Consistent Environment** - Same setup for all developers
- ✅ **Fast Builds** - Docker layer caching for quick rebuilds
- ✅ **Automatic Seeding** - Seeds run after migrations by default
- ✅ **Production Ready** - Skip seeds in production with `SKIP_SEED=true`
- ✅ **Full TypeScript Support** - Bun runtime for TypeScript seed files

### Files Structure

```
broccoli-dashboard/
├── Dockerfile.migrate       # Migration container definition
├── docker-compose.yml        # Database and migration services
├── .dockerignore            # Optimized Docker builds
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Migration files
│   └── seeds/               # Seed files (TypeScript)
└── docs/
    ├── MIGRATION_QUICKSTART.md
    ├── DATABASE_SETUP.md
    └── DOCKER_MIGRATIONS.md
```

## 🎯 Common Tasks

### Run Migrations

```bash
# With seeds (default)
docker-compose up migrate

# Without seeds
SKIP_SEED=true docker-compose up migrate
```

### Create New Migration

```bash
# Create migration locally
npx prisma migrate dev --name add_new_feature

# Rebuild and apply
docker-compose build migrate
docker-compose up migrate
```

### Run Seeds Manually

```bash
# Using bun
bun prisma/seeds/index.ts

# Using pnpm
pnpm db:seed
```

### Reset Database

```bash
# ⚠️ WARNING: Deletes all data
docker-compose down -v
docker-compose up -d db
docker-compose up migrate
```

## 🔧 Configuration

### Environment Variables

The migration service loads environment variables from `.env`:

```yaml
# In docker-compose.yml
migrate:
  env_file:
    - .env  # Loads all env vars for seeding
  environment:
    DATABASE_URL: postgresql://postgres:postgres@db:5432/broccoli
    SKIP_SEED: ${SKIP_SEED:-false}
```

### Skip Seeding

Control seeding behavior:

```bash
# Via command line
SKIP_SEED=true docker-compose up migrate

# Via .env file
echo "SKIP_SEED=true" >> .env
docker-compose up migrate
```

## 🔌 Database Connection

Connect to your local PostgreSQL database:

| Property | Value |
|----------|-------|
| Host | `localhost` |
| Port | `8008` (check docker-compose.yml) |
| Database | `broccoli` |
| Username | `postgres` |
| Password | `postgres` |

**Connection String:**
```
postgresql://postgres:postgres@localhost:8008/broccoli
```

**Tools:**
- TablePlus, DBeaver, pgAdmin - Use connection details above
- Prisma Studio - Run `npx prisma studio`
- psql - `psql -h localhost -p 8008 -U postgres -d broccoli`

## 🏗️ How It Works

### Migration Flow

```
┌─────────────────────────────────────────┐
│  1. docker-compose up migrate           │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  2. Wait for database to be healthy     │
│     (healthcheck passes)                │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  3. Run: npx prisma migrate deploy      │
│     (Apply pending migrations)          │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  4. Check: SKIP_SEED != "true"?         │
└───────┬───────────────┬─────────────────┘
        │ YES           │ NO
        ▼               ▼
┌──────────────┐  ┌──────────────────────┐
│ Run seeds    │  │ Skip seeds           │
│ (bun)        │  │ (migrations only)    │
└──────────────┘  └──────────────────────┘
```

### Docker Image Layers

The migration image is optimized for caching:

1. **Base image** (node:20-alpine) - Cached
2. **System dependencies** (openssl, curl, bash, bun) - Cached
3. **Package files** (package.json, pnpm-lock.yaml) - Cached
4. **Dependencies install** - Only rebuilds if packages change
5. **Source code** (prisma/, src/) - Rebuilds on schema/code changes
6. **Prisma generate** - Only runs if schema changes
7. **Entrypoint script** - Cached

This means most builds are fast since only changed layers rebuild.

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Stop local PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql # Linux

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use different port
```

### Seeds Fail with Missing Env Vars

```bash
# Option 1: Skip seeds
SKIP_SEED=true docker-compose up migrate

# Option 2: Check .env file has all required variables
cat .env

# Option 3: Run seeds manually after fixing env vars
bun prisma/seeds/index.ts
```

### Migrations Not Applying

```bash
# Check database is running
docker-compose ps

# View database logs
docker-compose logs db

# View migration logs
docker-compose logs migrate

# Rebuild migration image
docker-compose build --no-cache migrate
```

### Can't Connect from Local Machine

```bash
# Check container is running
docker-compose ps

# Check port mapping
docker ps | grep postgres

# Test database connection
docker exec broccoli-postgres pg_isready -U postgres -d broccoli

# Check correct port in connection string
# (Should match docker-compose.yml ports mapping)
```

## 🎓 Best Practices

### Development

1. **Always rebuild after schema changes**
   ```bash
   docker-compose build migrate
   ```

2. **Test migrations before committing**
   ```bash
   docker-compose up migrate
   ```

3. **Use descriptive migration names**
   ```bash
   npx prisma migrate dev --name add_user_preferences
   ```

4. **Keep seeds idempotent**
   - Use `upsert` instead of `create` where possible
   - Check for existing data before inserting

### Production

1. **Always skip seeds**
   ```bash
   SKIP_SEED=true docker-compose up migrate
   ```

2. **Test migrations in staging first**
   - Never run untested migrations in production
   - Have rollback plan ready

3. **Use secrets management**
   - Don't commit `.env` files
   - Use CI/CD secret management
   - Rotate credentials regularly

4. **Monitor migration progress**
   - Watch logs during deployment
   - Have database backup ready

## 📊 Seeding

### What Gets Seeded

Default seeds (`prisma/seeds/index.ts`):
- Test users (admin, user1, user2, user3)
- Sample grocery trips
- Item types catalog

### When to Seed

- ✅ **Local development** - Fresh data for testing
- ✅ **Staging environment** - Consistent test data
- ❌ **Production** - Never auto-seed production!

### Customizing Seeds

Edit `prisma/seeds/index.ts` to customize seed data:

```typescript
// Add your custom seed data
await prisma.myModel.createMany({
  data: [
    { name: "Item 1" },
    { name: "Item 2" },
  ],
});
```

Then rebuild and run:

```bash
docker-compose build migrate
docker-compose up migrate
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Database Migration
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start Database
        run: docker-compose up -d db
      
      - name: Run Migrations (No Seeds)
        run: |
          docker-compose build migrate
          SKIP_SEED=true docker-compose up migrate
```

### GitLab CI Example

```yaml
migrate:
  stage: deploy
  script:
    - docker-compose up -d db
    - docker-compose build migrate
    - SKIP_SEED=true docker-compose up migrate
  only:
    - main
```

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🆘 Getting Help

If you encounter issues:

1. Check the documentation files listed at the top
2. Review the troubleshooting sections
3. Check container logs: `docker-compose logs migrate`
4. Verify environment variables: `cat .env`
5. Test database connection: `docker exec broccoli-postgres pg_isready`

## 📝 Summary

This migration system provides:
- ✅ Consistent, reproducible migrations
- ✅ Automatic database seeding
- ✅ Fast Docker-based builds
- ✅ Production-ready configuration
- ✅ Comprehensive documentation

Get started with just two commands:
```bash
docker-compose up -d db
docker-compose up migrate
```

Happy coding! 🥦