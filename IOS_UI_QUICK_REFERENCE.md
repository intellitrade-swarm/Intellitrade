
# iOS-Style UI Quick Reference

## 🚀 Quick Start

### Import Components
```tsx
import {
  IOSCard, IOSButton, IOSInput, IOSBadge,
  IOSSection, IOSContainer, IOSGrid, IOSText
} from '@/components/ui/ios-components';
```

---

## 📦 Common Patterns

### 1. Stats Card
```tsx
<IOSCard className="p-6">
  <h3 className="text-xl font-bold mb-2">Total Trades</h3>
  <p className="text-3xl text-premium-green font-bold">125</p>
  <IOSBadge variant="success">+12.5%</IOSBadge>
</IOSCard>
```

### 2. Button Group
```tsx
<div className="flex gap-3 ios-stack-mobile">
  <IOSButton variant="primary">Primary Action</IOSButton>
  <IOSButton variant="secondary">Cancel</IOSButton>
</div>
```

### 3. Form Input
```tsx
<div>
  <label className="block text-sm font-medium mb-2">Email</label>
  <IOSInput type="email" placeholder="your@email.com" />
</div>
```

### 4. Responsive Grid
```tsx
<IOSGrid columns={3}>
  <IOSCard>Card 1</IOSCard>
  <IOSCard>Card 2</IOSCard>
  <IOSCard>Card 3</IOSCard>
</IOSGrid>
```

### 5. Section Layout
```tsx
<IOSSection>
  <IOSContainer>
    <h2 className="text-3xl font-bold mb-8">Title</h2>
    {/* Content */}
  </IOSContainer>
</IOSSection>
```

---

## 🎨 CSS Classes

### Cards
- `ios-card` - Standard card
- `ios-card-elevated` - Premium elevated card

### Buttons
- `ios-button-primary` - Green gradient button
- `ios-button-secondary` - Outlined button

### Inputs
- `ios-input` - Form input with focus effects

### Badges
- `ios-badge-success` - Green success badge
- `ios-badge-error` - Red error badge
- `ios-badge-warning` - Yellow warning badge

### Layout
- `ios-section` - Section with responsive padding
- `ios-container` - Content container with max-width
- `ios-grid-2` / `ios-grid-3` / `ios-grid-4` - Responsive grids

### Text
- `ios-text-fit` - Prevent overflow
- `ios-text-truncate` - Single line ellipsis
- `ios-text-clamp-2` - 2 lines max
- `ios-text-clamp-3` - 3 lines max

### Responsive
- `ios-hide-mobile` - Hide on mobile (<768px)
- `ios-hide-desktop` - Hide on desktop (≥769px)
- `ios-full-mobile` - Full width on mobile
- `ios-stack-mobile` - Stack vertically on mobile

### Transitions
- `ios-transition` - Standard 300ms
- `ios-transition-fast` - Quick 150ms
- `ios-transition-slow` - Smooth 500ms

---

## 📱 Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 768px
- **Desktop:** > 768px
- **Large Desktop:** > 1400px

---

## ✨ Pro Tips

### 1. Prevent Text Overflow
```tsx
<IOSText clamp={2}>
  {longText}
</IOSText>
```

### 2. Stack on Mobile
```tsx
<div className="flex gap-4 ios-stack-mobile">
  <IOSButton>Button 1</IOSButton>
  <IOSButton>Button 2</IOSButton>
</div>
```

### 3. Hide Elements
```tsx
{/* Show only on desktop */}
<div className="ios-hide-mobile">Desktop Only</div>

{/* Show only on mobile */}
<div className="ios-hide-desktop">Mobile Only</div>
```

### 4. Smooth Transitions
```tsx
<div className="ios-transition hover:scale-105">
  Smooth hover effect
</div>
```

### 5. Safe Areas (for mobile notches)
```tsx
<div className="ios-safe-area">
  Content respects notches
</div>
```

---

## 🎯 Common Use Cases

### Dashboard Stats
```tsx
<IOSGrid columns={4}>
  {stats.map(stat => (
    <IOSCard key={stat.id} className="p-6">
      <IOSText clamp={1}>
        <h4 className="text-sm text-gray-400 mb-2">{stat.label}</h4>
      </IOSText>
      <p className="text-2xl font-bold text-premium-green">
        {stat.value}
      </p>
    </IOSCard>
  ))}
</IOSGrid>
```

### Agent Card
```tsx
<IOSCard elevated className="p-6">
  <div className="flex items-center justify-between mb-4">
    <IOSText clamp={1}>
      <h3 className="text-lg font-semibold">{agent.name}</h3>
    </IOSText>
    <IOSBadge variant={agent.active ? 'success' : 'error'}>
      {agent.active ? 'Active' : 'Inactive'}
    </IOSBadge>
  </div>
  
  <IOSText clamp={2} className="text-sm text-gray-400 mb-4">
    {agent.description}
  </IOSText>
  
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <p className="text-xs text-gray-500">Balance</p>
      <p className="text-lg font-semibold">${agent.balance}</p>
    </div>
    <div>
      <p className="text-xs text-gray-500">Win Rate</p>
      <p className="text-lg font-semibold">{agent.winRate}%</p>
    </div>
  </div>
  
  <IOSButton variant="primary" size="sm" className="w-full">
    View Details
  </IOSButton>
</IOSCard>
```

### Trade Row
```tsx
<div className="ios-card p-4 flex items-center justify-between ios-stack-mobile">
  <div className="flex items-center gap-3">
    <IOSBadge variant={trade.type === 'BUY' ? 'success' : 'error'}>
      {trade.type}
    </IOSBadge>
    <IOSText truncate>
      <span className="font-semibold">{trade.symbol}</span>
    </IOSText>
  </div>
  
  <div className="flex items-center gap-4 ios-full-mobile">
    <IOSText truncate className="text-sm text-gray-400">
      {trade.amount}
    </IOSText>
    <span className={trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
      {trade.pnl > 0 ? '+' : ''}{trade.pnl}%
    </span>
  </div>
</div>
```

### Modal/Dialog
```tsx
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <IOSCard elevated className="w-full max-w-md p-8">
    <h2 className="text-2xl font-bold mb-4">Confirm Action</h2>
    <IOSText clamp={3} className="text-gray-400 mb-6">
      Are you sure you want to proceed with this action? This cannot be undone.
    </IOSText>
    <div className="flex gap-3 ios-stack-mobile">
      <IOSButton variant="primary" className="flex-1">
        Confirm
      </IOSButton>
      <IOSButton variant="secondary" className="flex-1">
        Cancel
      </IOSButton>
    </div>
  </IOSCard>
</div>
```

### Loading State
```tsx
import { IOSSpinner } from '@/components/ui/ios-components';

<div className="flex flex-col items-center justify-center p-12">
  <IOSSpinner size="lg" />
  <p className="mt-4 text-gray-400">Loading...</p>
</div>
```

---

## 🔍 Debugging

### Text Overflow?
Add `ios-text-fit` or use `IOSText` component

### Layout Breaking on Mobile?
Use `ios-stack-mobile` for flex containers

### Buttons Too Small on Mobile?
iOS buttons have minimum 44px touch targets by default

### Cards Not Rounded?
Check if you're using `ios-card` instead of old classes

### Animations Choppy?
Use `ios-transition` for smooth 60fps animations

---

## 📊 Component Props

### IOSCard
```tsx
<IOSCard 
  elevated={boolean}      // Use elevated variant
  className={string}      // Additional classes
/>
```

### IOSButton
```tsx
<IOSButton 
  variant="primary|secondary|ghost"
  size="sm|md|lg"
  className={string}
  disabled={boolean}
/>
```

### IOSInput
```tsx
<IOSInput 
  type="text|email|password|..."
  placeholder={string}
  className={string}
  disabled={boolean}
/>
```

### IOSBadge
```tsx
<IOSBadge 
  variant="default|success|error|warning"
  className={string}
/>
```

### IOSGrid
```tsx
<IOSGrid 
  columns={1|2|3|4}
  className={string}
/>
```

### IOSText
```tsx
<IOSText 
  clamp={1|2|3}           // Line clamp
  truncate={boolean}       // Single line ellipsis
  className={string}
/>
```

---

## 🌈 Theme Colors

```tsx
// Text Colors
text-premium-green        // #00ff88
text-premium-green-dark   // #10b981

// Background
bg-premium-black          // #000000
bg-premium-dark           // #0a0f0d

// Border
border-premium-green/20   // With opacity
```

---

## ✅ Migration Checklist

- [ ] Replace old card classes with `ios-card`
- [ ] Update buttons to use `ios-button-primary` or `ios-button-secondary`
- [ ] Add `ios-text-fit` or `IOSText` wrapper for long text
- [ ] Use `ios-grid-*` for responsive layouts
- [ ] Add `ios-stack-mobile` for mobile-friendly flex
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify no horizontal scrolling
- [ ] Check text is readable at all sizes
- [ ] Ensure touch targets are ≥44px

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Production Ready  
**Deployed:** https://intellitrade.xyz
