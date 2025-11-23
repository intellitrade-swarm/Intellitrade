#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}     iPool Swarms - GitHub Push Automation Script${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/github_key ]; then
    echo -e "${RED}❌ SSH key not found!${NC}"
    echo -e "${YELLOW}Generating new SSH key...${NC}"
    ssh-keygen -t ed25519 -C "jonathanwier@gmail.com" -f ~/.ssh/github_key -N ""
    echo -e "${GREEN}✅ SSH key generated${NC}"
fi

# Display the SSH public key
echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"
echo -e "${YELLOW}Your SSH Public Key (add this to GitHub):${NC}"
echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"
cat ~/.ssh/github_key.pub
echo ""
echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"
echo ""
echo -e "${GREEN}📋 Copy the key above and add it to GitHub:${NC}"
echo -e "   1. Go to: ${YELLOW}https://github.com/settings/keys${NC}"
echo -e "   2. Click ${GREEN}\"New SSH key\"${NC}"
echo -e "   3. Title: ${GREEN}ipool-swarms deployment${NC}"
echo -e "   4. Paste the key above"
echo -e "   5. Click ${GREEN}\"Add SSH key\"${NC}"
echo ""
read -p "Press ENTER after you've added the SSH key to GitHub..."

# Configure SSH
echo ""
echo -e "${GREEN}⚙️  Configuring SSH...${NC}"

# Add GitHub to known hosts
ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null

# Create SSH config
cat > ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_key
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_key
chmod 644 ~/.ssh/github_key.pub

echo -e "${GREEN}✅ SSH configured${NC}"
echo ""

# Test SSH connection
echo -e "${GREEN}🔍 Testing SSH connection to GitHub...${NC}"
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo -e "${GREEN}✅ SSH connection successful!${NC}"
else
    echo -e "${YELLOW}⚠️  SSH test inconclusive, but proceeding...${NC}"
fi
echo ""

# Navigate to project directory
cd /home/ubuntu/ipool_swarms/nextjs_space

# Set remote URL to SSH
echo -e "${GREEN}🔗 Configuring Git remote...${NC}"
git remote set-url origin git@github.com:jonathanwier/ipool-swarms.git
echo -e "${GREEN}✅ Remote URL set to: git@github.com:jonathanwier/ipool-swarms.git${NC}"
echo ""

# Show current status
echo -e "${GREEN}📊 Git Status:${NC}"
git status --short | head -10
echo ""

# Push to GitHub
echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
echo ""

if git push -u origin main; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}     ✅ SUCCESS! Code pushed to GitHub!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}🌐 View your repository at:${NC}"
    echo -e "   ${YELLOW}https://github.com/jonathanwier/ipool-swarms${NC}"
    echo ""
    echo -e "${GREEN}📦 Next steps:${NC}"
    echo -e "   • Share the repository with collaborators"
    echo -e "   • Set up GitHub Actions for CI/CD"
    echo -e "   • Clone on other machines: ${YELLOW}git clone git@github.com:jonathanwier/ipool-swarms.git${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}     ❌ Push failed!${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo -e "   1. Verify SSH key was added correctly to GitHub"
    echo -e "   2. Check GitHub repository exists: ${YELLOW}https://github.com/jonathanwier/ipool-swarms${NC}"
    echo -e "   3. Try: ${GREEN}ssh -T git@github.com${NC} to test SSH connection"
    echo -e "   4. See GITHUB_PUSH_COMPLETE_GUIDE.md for alternative methods"
    echo ""
fi

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
