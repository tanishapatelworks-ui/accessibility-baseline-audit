# Responsive Design Tokens & Mobile-First CSS Architecture

This project implements a responsive enterprise dashboard using modern CSS architecture and mobile-first design principles.

## Features

- CSS custom properties used as reusable design tokens
- Centralized color palette
- Typography scale
- Spacing tokens
- Border-radius tokens
- Soft shadow tokens
- CSS Grid for responsive dashboard layouts
- Flexbox for navigation and component alignment
- Mobile-first CSS architecture
- Responsive breakpoints at 320px, 768px, 1024px, and 1440px
- Glassmorphism effects using backdrop-filter
- Soft shadows and hover transitions
- Light and dark theme variables
- Reduced-motion accessibility support
- No horizontal scrollbar on the overall mobile page

## Responsive Breakpoints

| Breakpoint | Purpose |
|------------|---------|
| 320px | Mobile |
| 768px | Tablet |
| 1024px | Desktop |
| 1440px | Large desktop |

## Design Tokens

Design tokens are defined inside `:root` in `styles.css`.

They include:

- Brand colors
- Background colors
- Text colors
- Typography sizes
- Spacing values
- Border radii
- Shadows
- Layout dimensions
- Transition values

## Accessibility

The responsive design preserves the accessibility features from the previous implementation, including:

- Skip navigation link
- Semantic HTML5 structure
- Visible keyboard focus states
- Accessible form labels
- Fieldset and legend
- Required form validation
- Accessible table headers
- Native dialog modal
- Reduced-motion preference support

## Screenshots

Responsive demonstration screenshots are available in the `screenshots` folder:

- `mobile.png` — 320px viewport
- `tablet.png` — 768px viewport
- `desktop.png` — 1440px viewport

## Files

```text
semantic-dashboard/
├── index.html
├── styles.css
├── README.md
└── screenshots/
    ├── mobile.png
    ├── tablet.png
    └── desktop.png