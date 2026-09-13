# CSS Refactoring Summary

## Overview
This refactor eliminates CSS duplication across Vue3 components by centralizing theme variables and reusable utility classes into two global CSS files.

## Files Created

### 1. `ultistats/src/assets/variables.css`
Defines all CSS custom properties (variables) for consistent theming:

**Color Palette:**
- `--color-dark-bg: #1a1a1a` - Main dark background
- `--color-darker-bg: #242424` - Darker variant (controls)
- `--color-card-bg: #333` - Card/component background
- `--color-border: #444` - Border color
- `--color-border-hover: #2a4a52` - Hover border color
- `--color-text-primary: #e0e0e0` - Primary text
- `--color-text-secondary: #b0b0b0` - Secondary text
- `--color-text-light: #fff` - Light text
- `--color-accent: #00bcd4` - Accent color (teal)
- `--color-accent-hover: #00a8c8` - Accent on hover

**Spacing:**
- `--spacing-xs: 3px`
- `--spacing-sm: 5px`
- `--spacing-md: 10px`
- `--spacing-lg: 20px`
- `--spacing-xl: 30px`

**Sizing & Typography:**
- `--border-radius-sm: 3px`
- `--border-radius-md: 5px`
- `--font-family-base: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- `--button-min-width: 100px`
- `--button-padding: var(--spacing-sm) var(--spacing-md)`
- `--button-height: 38px`
- `--input-min-width: 100px`
- `--input-height: 38px`
- `--input-width-medium: 300px`

### 2. `ultistats/src/assets/global-styles.css`
Imports variables.css and defines reusable utility classes:

**Button Styles:**
- `.btn-base` - Base button styling (can be used with HTML buttons)
- `.btn-active` - Active button state
- `sl-button::part(base)` - Shoelace button styling
- `sl-button:hover`, `sl-button.active` - Button states

**Input Styles:**
- `.input-base` - Base input field styling with focus states
- `.input-medium` - Medium width input (300px)

**Container Styles:**
- `.input-container` - Flex container for inputs/buttons
- `.controls-container` - Container for video controls

**Split Panel Styles:**
- `sl-split-panel::part(divider)` - Divider styling with hover effects
- Panel slot styling

**Utility Classes:**
- `.control-button` - Generic control button
- `.text-light`, `.text-secondary`, `.text-sm` - Text utilities
- `.text-center` - Text alignment
- `.gap-md`, `.gap-lg` - Gap utilities
- `.mb-sm`, `.mb-md`, `.mt-sm`, `.mt-md` - Margin utilities
- `.p-md` - Padding utility
- `.overlay`, `.overlay-bottom-left` - Overlay positioning

## Files Refactored

### Components Updated to Use Global Styles:

1. **App.vue**
   - Removed hardcoded colors and spacing
   - Now relies on global variables and utility classes

2. **FileSaver.vue**
   - Replaced `.styled-input` with `.input-base input-medium` classes
   - Uses global CSS variables for colors and spacing

3. **YoutubeVideoSelector.vue**
   - Replaced `.styled-input` with `.input-base input-medium` classes
   - Uses `.input-container` for layout

4. **VideoPlayer.vue**
   - Replaced `.custom-controls` with `.controls-container` class
   - Replaced individual button styles with `.control-button` class
   - Uses `.text-sm text-secondary` utility classes
   - Uses `.overlay overlay-bottom-left` for positioning

5. **WindowHolder.vue**
   - Uses CSS variables throughout for all colors
   - `.title-bar` uses `var(--color-card-bg)` and `var(--color-border)`
   - `.icon-button` uses accent color on hover

6. **JournalViewer.vue**
   - `.button-container` uses `var(--spacing-md)` for padding
   - `.pass-button` uses CSS variables for colors
   - Uses `var(--color-accent)` for active state

7. **main.ts**
   - Added imports for `variables.css` and `global-styles.css`

## Benefits

✅ **DRY (Don't Repeat Yourself)** - No more duplicated color values across components
✅ **Maintainability** - Update theme colors in one place
✅ **Consistency** - All components use the same spacing and sizing
✅ **Scalability** - Easy to add new utility classes
✅ **Performance** - Reduced CSS file size
✅ **Flexibility** - CSS variables allow runtime theme changes if needed

## Theme Change Example

To change the entire theme accent color from teal to another color:

**Before (Multiple Files):**
```css
/* In App.vue */
border: 2px solid #00bcd4;
/* In FileSaver.vue */
border-color: #00bcd4;
/* In JournalViewer.vue */
color: #00bcd4;
/* ... repeated in many files */
```

**After (One Place):**
```css
/* In variables.css */
--color-accent: #new-color;
```

## CSS Variable Hierarchy

```
variables.css (defines all variables)
    ↓
global-styles.css (uses variables to define reusable classes)
    ↓
Component scoped styles (uses both variables and global classes)
    ↓
Rendered CSS
```

## Future Improvements

1. Consider adding dark/light theme switching by toggling CSS variable values
2. Add animation/transition variables for consistent motion
3. Create component-specific variable overrides if needed
4. Consider using CSS variables for z-index layering
5. Add breakpoint variables for responsive design

## How to Use

All components now automatically have access to:
- CSS variables: `var(--color-primary)`, `var(--spacing-md)`, etc.
- Utility classes: `.input-base`, `.control-button`, `.text-sm`, etc.

Just reference them in your scoped `<style>` blocks or class attributes!
