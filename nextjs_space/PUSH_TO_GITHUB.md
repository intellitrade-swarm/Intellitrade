# 🚀 Quick Reference: Push to GitHub

## Prerequisites
- GitHub account
- Repository created on GitHub (private recommended)

## Step 1: Get Your GitHub Repository URL

After creating a repository on GitHub, copy the URL. It will look like:
```
https://github.com/YOUR_USERNAME/ichain-swarms.git
```

## Step 2: Add Remote and Push

```bash
cd /home/ubuntu/ipool_swarms/nextjs_space

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/ichain-swarms.git

# Push all code to GitHub
git push -u origin master
```

## Step 3: Enter Credentials

When prompted:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your actual password)
  - Get token at: https://github.com/settings/tokens
  - Required scope: `repo`

## ✅ Done!

Your code is now on GitHub! Visit your repository URL to verify.

## 📚 Detailed Instructions

See `GITHUB_SETUP.md` for comprehensive setup guide including:
- Branch protection
- GitHub Actions setup
- Security configuration
- Ongoing workflow

---

**Need help?** Check GITHUB_SETUP.md for troubleshooting.
