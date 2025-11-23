
# 🖥️ Terminal Theme - Quick Reference

## 🎨 Terminal Colors

### Main Colors
```typescript
text-terminal-green          // #00FF41 - Main text
text-terminal-green-dim      // #00DD33 - Secondary text
text-terminal-green-bright   // #00FF66 - Highlights
bg-terminal-black            // #000000 - Background
bg-terminal-darker           // #000800 - Card backgrounds
bg-terminal-dark             // #001100 - Hover states
```

### Borders
```typescript
border-terminal-green         // Primary borders
border-terminal-green-dark    // Card borders
border-terminal-green-darker  // Input borders
```

---

## ✨ Animations

```typescript
animate-terminal-glow  // Glowing text effect
animate-flicker        // CRT flicker
animate-blink          // Blinking cursor
animate-scan           // Scanline movement
```

---

## 🖊️ Text Conventions

### Headers
```
[DEFIDASH_INTELLITRADE]
> PREMIERE_ORACLE_SERVICE
```

### Descriptions
```
MULTI-SOURCE_AGGREGATION // AI_INSIGHTS // ON-CHAIN_DATA
```

### Buttons
```
[ SIGN_IN ]
[ CREATE_ACCOUNT ]
[ AUTO_REFRESH: ON ]
```

### Status
```
█ SYSTEM_READY
█ UPDATING...
> COMMAND_EXECUTED
```

---

## 🎯 Component Styles

### Button
```typescript
className="bg-terminal-green text-terminal-black hover:bg-terminal-green-bright 
           font-terminal tracking-wider border-2 border-terminal-green 
           shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all"
```

### Input
```typescript
className="bg-terminal-black border-2 border-terminal-green-darker 
           text-terminal-green font-terminal 
           focus:border-terminal-green focus:ring-terminal-green-glow"
```

### Card
```typescript
className="border-2 border-terminal-green-dark bg-terminal-darker/80 
           shadow-[0_0_25px_rgba(0,255,65,0.2)]"
```

---

## 📐 Background Effects

### Page Container
```typescript
<div className="min-h-screen bg-terminal-black relative font-terminal overflow-hidden">
  {/* Background effects */}
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-terminal" />
    <div className="absolute inset-0 bg-scanline opacity-20" />
    <div className="absolute inset-0 animate-flicker" />
    <div className="absolute inset-0" style={{
      backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.05) 1px, transparent 1px)',
      backgroundSize: '50px 50px'
    }} />
  </div>
  
  {/* Content */}
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>
```

---

## 🎨 Typography

### Font Family
```typescript
font-terminal  // Courier New, Monaco, Consolas, monospace
```

### Tracking
```typescript
tracking-wide   // Letter spacing
tracking-wider  // More letter spacing
```

---

## ⚡ Common Patterns

### Terminal Header
```typescript
<h1 className="text-3xl font-bold text-terminal-green animate-terminal-glow font-terminal tracking-wider">
  [SYSTEM_NAME]
</h1>
<p className="text-terminal-green-dim font-terminal text-sm">
  DESCRIPTION // WITH_SEPARATORS
</p>
```

### Terminal Status
```typescript
<div className="text-terminal-green-dim font-terminal">
  <span className="animate-blink">█</span> STATUS_MESSAGE
</div>
```

### Terminal Form Label
```typescript
<Label className="text-terminal-green font-terminal text-sm tracking-wide">
  &gt; FIELD_NAME:
</Label>
```

---

## 🚀 Pages Using Terminal Theme

- ✅ Landing (`/`)
- ✅ Sign In (`/auth/signin`)
- ✅ Sign Up (`/auth/signup`)
- ✅ Arena (`/arena`)
- ✅ Oracle (`/oracle`)

---

## 📝 Naming Conventions

### Use Underscores
```
INTELLIGENT_TRADING_PROTOCOL
PREMIERE_ORACLE_SERVICE
AUTO_REFRESH
```

### Use Double Slashes
```
MULTI-SOURCE // AI_INSIGHTS // ON-CHAIN
```

### Use Angle Brackets
```
> COMMAND
> EMAIL:
> PASSWORD:
```

### Use Square Brackets
```
[ SIGN_IN ]
[ CREATE_ACCOUNT ]
[ AUTO_REFRESH: ON ]
```

---

## 🎯 Live URL

**https://intellitrade.xyz**

All pages now feature the AI Terminal retro theme!

---

*Quick reference for Terminal Theme v1.0.0*
*Updated: November 17, 2025*
