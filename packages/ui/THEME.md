# Shared Tailwind Theme

This package provides a shared Tailwind CSS theme for both the web and admin apps.

## How it works

1. **Theme Definition**: All design tokens (colors, spacing, etc.) are defined in `src/theme.css`
2. **Import in Apps**: Each app imports the shared theme in their `global.css`:
   ```css
   @import "tailwindcss";
   @import "@gearboxe-market/ui/theme";
   ```
3. **Content Scanning**: Each app's `tailwind.config.ts` scans the UI package:
   ```typescript
   content: [
     // app files...
     "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
   ]
   ```

## Customization

To customize the theme:
1. Edit `src/theme.css` in this package
2. Changes will apply to all apps that import the theme
3. Apps can override styles in their own `global.css`

## Adding new tokens

Add to `@theme` block in `src/theme.css`:

```css
@theme {
  --color-new-token: #value;
}
```

Then use it in your components:
```tsx
<div className="bg-new-token">...</div>
```
