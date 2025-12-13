#!/bin/bash

# ============================================
# Supabase Database Setup Script
# ============================================
# This script helps you set up the Supabase database for the wedding website
# It will guide you through the process and run the migration

set -e  # Exit on error

echo "🗄️  Rachel & Tim Wedding Website - Database Setup"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo ""
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "📝 Please edit the .env file and add your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_KEY"
    echo "   - RESEND_API_KEY"
    echo "   - ADMIN_EMAIL"
    echo ""
    echo "Then run this script again."
    exit 0
fi

# Source the .env file
source .env

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "your_supabase_project_url" ]; then
    echo "❌ SUPABASE_URL is not set in .env file"
    echo "Please add your Supabase project URL to the .env file"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ] || [ "$SUPABASE_SERVICE_KEY" = "your_supabase_service_role_key" ]; then
    echo "❌ SUPABASE_SERVICE_KEY is not set in .env file"
    echo "Please add your Supabase service role key to the .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Display migration file
echo "📄 Migration file to be executed:"
echo "   supabase/migrations/001_initial_schema.sql"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with the database setup? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 0
fi

echo ""
echo "🚀 Setting up database..."
echo ""

# Instructions for manual setup
echo "📋 Manual Setup Instructions:"
echo ""
echo "1. Go to your Supabase project dashboard:"
echo "   ${SUPABASE_URL/https:\/\//https://app.supabase.com/project/}/sql/new"
echo ""
echo "2. Copy the contents of: supabase/migrations/001_initial_schema.sql"
echo ""
echo "3. Paste it into the SQL Editor"
echo ""
echo "4. Click 'Run' to execute the migration"
echo ""
echo "5. Verify the tables were created:"
echo "   - rsvps"
echo "   - guestbook"
echo "   - visitor_count"
echo ""

# Display the migration file content
echo "📝 Migration SQL (copy this):"
echo "================================"
cat supabase/migrations/001_initial_schema.sql
echo "================================"
echo ""

echo "✅ Setup instructions displayed!"
echo ""
echo "After running the migration in Supabase, you can test the connection by running:"
echo "   npm run dev"
echo ""
echo "Then visit http://localhost:4321 to see your website!"
echo ""

# Made with Bob
