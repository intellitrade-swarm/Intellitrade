
# ⚡ Quick Push Reference

## Fastest Method: SSH in 3 Steps

### 1️⃣ Add SSH Key to GitHub
Go to: https://github.com/settings/keys

Click "New SSH key" and paste:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM2r2YasA7G/M1ekLqitrkdWCSV78wMxjH85qzvLHCab jonathanwier@gmail.com
```

### 2️⃣ Configure SSH
```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
cat > ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_key
EOF
chmod 600 ~/.ssh/config
```

### 3️⃣ Push
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
git remote set-url origin git@github.com:jonathanwier/ipool-swarms.git
git push -u origin main
```

---

## Alternative: Personal Access Token

1. Create token: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select **repo** scope
   - Copy token immediately

2. Push:
```bash
cd /home/ubuntu/ipool_swarms/nextjs_space
git remote set-url origin https://jonathanwier:YOUR_TOKEN@github.com/jonathanwier/ipool-swarms.git
git push -u origin main
```

---

## Verify
https://github.com/jonathanwier/ipool-swarms

---

*See GITHUB_PUSH_COMPLETE_GUIDE.md for detailed instructions*
