#!/bin/bash

# Configuration
EC2_USER="ubuntu"
EC2_HOST="your-ec2-ip-or-dns"
EC2_KEY="path/to/your-key.pem"
SERVER_DIR="~/server"
LOCAL_ENV_FILE=".env"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting environment deployment..."

# Check if key file exists
if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}Error: SSH key file not found: $EC2_KEY${NC}"
    exit 1
fi

# Check if env file exists
if [ ! -f "$LOCAL_ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Create server directory if it doesn't exist
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "mkdir -p $SERVER_DIR"

# Transfer the env file
echo "📦 Transferring environment files..."
rsync -avz --progress -e "ssh -i $EC2_KEY" \
    "$LOCAL_ENV_FILE" \
    "$EC2_USER@$EC2_HOST:$SERVER_DIR/.env"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Environment files deployed successfully!${NC}"
    echo -e "${GREEN}🔒 Securing environment files...${NC}"
    
    # Set correct permissions on the server
    ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "chmod 600 $SERVER_DIR/.env"
    
    echo -e "${GREEN}✨ Deployment complete!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
