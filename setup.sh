#!/bin/bash
set -e

echo "🚀 Starting FoodPack AI setup (Native Mode)..."

echo "🐘 Checking if PostgreSQL is installed natively..."
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    sudo pacman -S postgresql --noconfirm
    sudo -iu postgres initdb -D /var/lib/postgres/data
fi

echo "🔄 Starting PostgreSQL service..."
sudo systemctl enable --now postgresql

echo "🛠️ Creating database and user if they don't exist..."
sudo -u postgres psql -c "CREATE USER foodpack WITH PASSWORD 'foodpack' SUPERUSER;" || true
sudo -u postgres psql -c "CREATE DATABASE foodpack OWNER foodpack;" || true
sudo -u postgres psql -d foodpack -c "GRANT ALL PRIVILEGES ON DATABASE foodpack TO foodpack;" || true
sudo -u postgres psql -d foodpack -c "GRANT ALL PRIVILEGES ON SCHEMA public TO foodpack;" || true

echo "📦 Installing dependencies..."
pnpm install

echo "🔄 Generating Prisma Client..."
pnpm run db:generate

echo "🏗️ Building shared packages..."
pnpm run build

echo "🗄️ Running database migrations..."
pnpm run db:migrate

echo "🌱 Seeding the database with initial data..."
pnpm run db:seed

echo "✅ Setup complete! Starting the application..."
echo "🌐 Starting Web and API servers concurrently..."

npx concurrently -c "green,blue" -n "WEB,API" "pnpm run dev:web" "pnpm run dev:api"
