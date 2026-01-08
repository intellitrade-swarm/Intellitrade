# X Posting Quick Reference

## Current Settings (INCREASED FREQUENCY)

| Setting | Previous | Now | Improvement |
|---------|----------|-----|-------------|
| Check Interval | 15 min | **5 min** | 3x Faster |
| Post Cooldown | 30 min | **10 min** | 3x Faster |
| Performance Updates | 4 hours | **2 hours** | 2x Faster |

## Service Status

- **PID**: Check with `ps aux | grep start-x-signal-posting`
- **Account**: @defidash_agent
- **Mode**: Real money trades only
- **Log**: `/home/ubuntu/ipool_swarms/nextjs_space/x_signal_posting.log`

## Quick Commands

### Check Status
```bash
ps aux | grep start-x-signal-posting | grep -v grep
```

### View Recent Activity
```bash
tail -50 /home/ubuntu/ipool_swarms/nextjs_space/x_signal_posting.log
```

### Restart Service
```bash
pkill -f "start-x-signal-posting"
cd /home/ubuntu/ipool_swarms/nextjs_space
nohup yarn tsx scripts/start-x-signal-posting.ts > x_signal_posting.log 2>&1 &
```

## What Gets Posted

1. **Trade Signals** - Within 10 minutes of execution
2. **Trade Closures** - With P&L >= $50
3. **Performance Updates** - Every 2 hours with >= 3 trades

## Branding

All posts include:
- "Defidash Agents on Intellitrade"
- No references to iCHAIN Swarms or ipool
- Professional trading tone

## Expected Impact

- 3x more trade signal posts
- 2x more performance updates
- Better engagement and visibility
- More timely real-time updates

