
# 📱 Responsive Design Quick Reference

**For:** Defidash Intellitrade  
**Status:** Active Guidelines

## 🎯 Quick Fixes for Common Issues

### **Text Overflowing Screen?**

```tsx
// Add these classes:
className="break-words"        // Break at word boundaries
className="break-all"          // Break anywhere (for URLs, emails)
className="truncate"           // Single line with ...
className="text-ellipsis-2"    // Two lines with ...
```

### **Header Too Big on Mobile?**

```tsx
// Use responsive sizing:
className="text-base sm:text-xl md:text-2xl"
className="text-2xl sm:text-4xl md:text-6xl"
className="text-4xl sm:text-6xl md:text-8xl"
```

### **Button Too Wide on Mobile?**

```tsx
// Make it full-width on mobile, auto on desktop:
<Link href="..." className="w-full sm:w-auto">
  <Button className="w-full sm:w-auto ...">
    {/* Content */}
  </Button>
</Link>
```

### **Icon Shrinking?**

```tsx
// Prevent shrinking:
<div className="flex-shrink-0">
  <Icons.something className="h-6 w-6" />
</div>
```

### **Layout Overflowing?**

```tsx
// Add proper container:
<div className="min-w-0 flex-1">
  {/* Content that can shrink */}
</div>

<div className="flex-shrink-0">
  {/* Content that shouldn't shrink */}
</div>
```

## 📏 Spacing Guidelines

### **Padding:**

```tsx
px-3 sm:px-6      // Horizontal padding
py-2 sm:py-4      // Vertical padding
p-4 sm:p-8        // All sides
```

### **Gaps:**

```tsx
gap-2 sm:gap-4    // Small gaps
gap-4 sm:gap-6    // Medium gaps
gap-6 sm:gap-8    // Large gaps
```

### **Margins:**

```tsx
mb-4 sm:mb-8      // Bottom margin
mt-8 sm:mt-12     // Top margin
mx-4 sm:mx-auto   // Horizontal centering
```

## 🎨 Typography Scale

### **Headings:**

```tsx
// Hero (huge):
text-4xl sm:text-6xl md:text-8xl

// Section Title (large):
text-3xl sm:text-5xl

// Card Title (medium):
text-2xl sm:text-4xl

// Subtitle (small):
text-lg sm:text-xl
```

### **Body Text:**

```tsx
// Description:
text-base sm:text-lg

// Small text:
text-sm sm:text-base

// Tiny text:
text-xs sm:text-sm
```

## 🔢 Icon Sizes

```tsx
// Small:
h-4 w-4 sm:h-5 sm:w-5

// Medium:
h-5 w-5 sm:h-6 sm:w-6

// Large:
h-10 w-10 sm:h-12 sm:w-12
```

## 🎭 Common Patterns

### **Responsive Card:**

```tsx
<Card className="premium-card p-4 sm:p-8 md:p-12 mx-4">
  <CardContent className="space-y-4 sm:space-y-6">
    {/* Content */}
  </CardContent>
</Card>
```

### **Responsive Header:**

```tsx
<header className="px-3 sm:px-6 py-3 sm:py-5">
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
      {/* Logo and title */}
    </div>
    <div className="flex space-x-2 sm:space-x-4 flex-shrink-0">
      {/* Buttons */}
    </div>
  </div>
</header>
```

### **Responsive Buttons:**

```tsx
<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
  <Button className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-6">
    {/* Content */}
  </Button>
</div>
```

### **Responsive Grid:**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
  {/* Items */}
</div>
```

## ⚠️ Avoid These Mistakes

### **❌ Don't Do:**

```tsx
// Fixed widths:
className="w-[500px]"

// Absolute sizing:
style={{ fontSize: '48px' }}

// No word break on long text:
<span>very-long-telegram-username-without-break</span>

// Missing responsive variants:
className="text-6xl"
```

### **✅ Do Instead:**

```tsx
// Max widths:
className="max-w-2xl"

// Responsive sizing:
className="text-4xl sm:text-6xl"

// Word breaking:
<span className="break-all">very-long-username</span>

// Always include responsive:
className="text-2xl sm:text-4xl md:text-6xl"
```

## 🎯 Breakpoints

```css
/* Tailwind default breakpoints */
sm:  640px   /* Tablet portrait */
md:  768px   /* Tablet landscape */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

## 🛠️ Utility Classes Added

```css
/* In globals.css */

/* Prevent horizontal overflow */
html, body {
  overflow-x: hidden;
}

/* Text truncation */
.text-ellipsis-2 { /* ... after 2 lines */ }
.text-ellipsis-3 { /* ... after 3 lines */ }

/* No overflow utility */
.no-overflow {
  overflow-x: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

## 🔍 Testing Checklist

When adding new components:

- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Check for horizontal scrollbar
- [ ] Verify text is readable
- [ ] Ensure buttons are accessible
- [ ] Test with long content
- [ ] Test with short content

## 💡 Pro Tips

1. **Mobile First:** Start with mobile classes, add `sm:`, `md:`, etc.
2. **Use `min-w-0`:** Allows flex items to shrink below content size
3. **Use `flex-shrink-0`:** Prevents icons and important items from shrinking
4. **Word Breaking:** Use `break-words` for general text, `break-all` for URLs/emails
5. **Always Test:** Check on actual mobile devices, not just browser tools

## 🚀 Quick Commands

```bash
# Test in browser at different sizes
# Chrome DevTools: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)

# Common test sizes:
# 375px  - iPhone SE
# 390px  - iPhone 12/13
# 414px  - iPhone Plus
# 768px  - iPad
# 1024px - iPad Pro
# 1440px - Desktop
```

---

**Remember:** When in doubt, add responsive variants! It's better to be explicit than to assume.

**Key Principle:** Everything should look perfect from 320px to 4K displays. 📱💻🖥️
