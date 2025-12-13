#!/bin/bash

# Deployment Check Script for Rachel & Tim's Wedding Website
# This script verifies that your environment is ready for deployment

set -e

echo "🚀 Rachel & Tim's Wedding Website - Deployment Check"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ERRORS=0
WARNINGS=0

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Function to print info
info() {
    echo -e "ℹ $1"
}

echo "1. Checking Node.js and npm..."
echo "--------------------------------"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js installed: $NODE_VERSION"
    
    # Check if Node version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        success "Node.js version is 18 or higher"
    else
        error "Node.js version should be 18 or higher (current: $NODE_VERSION)"
    fi
else
    error "Node.js is not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    success "npm installed: $NPM_VERSION"
else
    error "npm is not installed"
fi

echo ""
echo "2. Checking project files..."
echo "--------------------------------"

# Check for required files
REQUIRED_FILES=(
    "package.json"
    "astro.config.mjs"
    "tsconfig.json"
    ".env.example"
    ".gitignore"
    "src/pages/index.astro"
    "src/pages/rsvp.astro"
    "src/pages/guestbook.astro"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        error "Missing: $file"
    fi
done

echo ""
echo "3. Checking environment variables..."
echo "--------------------------------"

if [ -f ".env" ]; then
    success "Found .env file"
    
    # Check for required environment variables
    REQUIRED_VARS=(
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_KEY"
        "RESEND_API_KEY"
        "ADMIN_EMAIL"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            VALUE=$(grep "^${var}=" .env | cut -d'=' -f2)
            if [ -z "$VALUE" ] || [ "$VALUE" = "your_"* ]; then
                error "$var is not set or has placeholder value"
            else
                success "$var is set"
            fi
        else
            error "$var is missing from .env"
        fi
    done
else
    error ".env file not found"
    info "Copy .env.example to .env and fill in your values"
fi

# Check that .env is in .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "^\.env$" .gitignore; then
        success ".env is in .gitignore"
    else
        error ".env is NOT in .gitignore - this is a security risk!"
    fi
fi

echo ""
echo "4. Checking dependencies..."
echo "--------------------------------"

if [ -d "node_modules" ]; then
    success "node_modules directory exists"
else
    warning "node_modules not found - run 'npm install'"
fi

if [ -f "package-lock.json" ]; then
    success "package-lock.json exists"
else
    warning "package-lock.json not found"
fi

echo ""
echo "5. Testing database connection..."
echo "--------------------------------"

if [ -f ".env" ]; then
    # Source the .env file
    export $(cat .env | grep -v '^#' | xargs)
    
    if [ ! -z "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "your_supabase_project_url" ]; then
        # Try to ping Supabase
        if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_ANON_KEY" | grep -q "200\|401"; then
            success "Supabase connection successful"
        else
            error "Cannot connect to Supabase - check your URL and keys"
        fi
    else
        warning "Supabase URL not configured - skipping connection test"
    fi
else
    warning "Cannot test database connection - .env file missing"
fi

echo ""
echo "6. Running build test..."
echo "--------------------------------"

info "Running 'npm run build'..."
if npm run build > /dev/null 2>&1; then
    success "Build completed successfully"
    
    # Check if dist directory was created
    if [ -d "dist" ]; then
        success "dist directory created"
        
        # Check for index.html
        if [ -f "dist/index.html" ]; then
            success "index.html generated"
        else
            error "index.html not found in dist"
        fi
    else
        error "dist directory not created"
    fi
else
    error "Build failed - run 'npm run build' to see errors"
fi

echo ""
echo "7. Checking Git status..."
echo "--------------------------------"

if command -v git &> /dev/null; then
    success "Git is installed"
    
    if [ -d ".git" ]; then
        success "Git repository initialized"
        
        # Check for uncommitted changes
        if [ -z "$(git status --porcelain)" ]; then
            success "No uncommitted changes"
        else
            warning "You have uncommitted changes"
            info "Run 'git status' to see them"
        fi
        
        # Check if remote is set
        if git remote -v | grep -q "origin"; then
            success "Git remote 'origin' is configured"
        else
            warning "Git remote 'origin' not configured"
            info "Add remote: git remote add origin <your-repo-url>"
        fi
    else
        warning "Not a Git repository"
        info "Initialize with: git init"
    fi
else
    error "Git is not installed"
fi

echo ""
echo "=================================================="
echo "Summary"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! You're ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect your repository to Vercel"
    echo "3. Add environment variables in Vercel"
    echo "4. Deploy!"
    echo ""
    echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo "Review the warnings above before deploying."
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors above before deploying."
    echo "See DEPLOYMENT_GUIDE.md for help."
    exit 1
fi

# Made with Bob
