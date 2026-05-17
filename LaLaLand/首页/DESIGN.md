---
name: City of Stars
colors:
  surface: '#141316'
  surface-dim: '#141316'
  surface-bright: '#3b383c'
  surface-container-lowest: '#0f0e11'
  surface-container-low: '#1d1b1f'
  surface-container: '#211f23'
  surface-container-high: '#2b292d'
  surface-container-highest: '#363438'
  on-surface: '#e6e1e6'
  on-surface-variant: '#cbc4d0'
  inverse-surface: '#e6e1e6'
  inverse-on-surface: '#323034'
  outline: '#948f99'
  outline-variant: '#49454e'
  surface-tint: '#d1bdfa'
  primary: '#d1bdfa'
  on-primary: '#372759'
  primary-container: '#2b1b4d'
  on-primary-container: '#9583bc'
  inverse-primary: '#66558b'
  secondary: '#b9c3ff'
  on-secondary: '#1a2a6c'
  secondary-container: '#354487'
  on-secondary-container: '#a6b4ff'
  tertiary: '#e5c18f'
  on-tertiary: '#422c07'
  tertiary-container: '#352100'
  on-tertiary-container: '#a6875a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d1bdfa'
  on-primary-fixed: '#211143'
  on-primary-fixed-variant: '#4e3e71'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b9c3ff'
  on-secondary-fixed: '#001356'
  on-secondary-fixed-variant: '#334284'
  tertiary-fixed: '#ffddb0'
  tertiary-fixed-dim: '#e5c18f'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#5b421c'
  background: '#141316'
  on-background: '#e6e1e6'
  surface-variant: '#363438'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is an ode to the romanticism of mid-century cinema, capturing the bittersweet beauty of ambition and love. It evokes a sense of "Technicolor nostalgia"—vibrant yet grounded in a deep, starlit atmosphere. The UI should feel like a private jazz club at dusk: intimate, sophisticated, and slightly magical.

The design style is a hybrid of **Modern Minimalism** and **Cinematic Dreamscapes**. It utilizes high-contrast accents against dark, expansive backgrounds, enriched with subtle grain and light-leak effects. Surfaces are not merely flat planes; they are windows into a twilight world, using soft glows and layered depth to mimic the bokeh of city lights.

## Colors

The palette is anchored in the transition from dusk to night. 

- **Primary & Secondary:** Twilight Purple and Royal Blue form the foundation, used for deep gradients and structural surfaces to create a sense of vast, evening skies.
- **Accents:** 'Mia Yellow' is the spotlight color, used for primary actions and critical highlights to draw the eye like a lone lamp post. 'Sunset Pink' provides a romantic counterpoint, used for secondary interactions and emotive highlights.
- **Backgrounds:** A deep navy base is layered with a subtle, non-tiling "Starry Night" texture—a scattering of low-opacity white pixels with varying glows.
- **Status Colors:** Success (Emerald), Error (Ruby), and Info (Azure) should be slightly desaturated to maintain the vintage film aesthetic.

## Typography

Typography functions as the "opening credits" of the interface. 

- **Headlines:** Use **Playfair Display**. It provides the high-contrast, vintage serif look required for a 1950s cinematic feel. Use tight letter-spacing for large displays to create a sophisticated, editorial impact.
- **Body:** **Hanken Grotesk** offers a clean, contemporary grotesque that ensures readability for long-form blog content while feeling modern enough to balance the vintage headings.
- **Labels:** Always rendered in Hanken Grotesk with generous letter-spacing and uppercase styling to mimic the aesthetic of mid-century theater signage.

## Layout & Spacing

The layout is theatrical and centered, often utilizing wide margins to create a "letterboxed" cinematic feel.

- **Grid:** A 12-column fixed grid for desktop, transitioning to a fluid 4-column grid for mobile. 
- **Rhythm:** Spacing is generous. Content should never feel cramped; white space (or "starry space") is used to elevate the perceived importance of each element.
- **Breakpoints:** 
  - Mobile: < 600px (Margins: 16px)
  - Tablet: 600px - 1024px (Margins: 32px)
  - Desktop: > 1024px (Margins: Auto, Max-width 1200px)

## Elevation & Depth

Depth is achieved through **Luminous Layering** rather than traditional shadows.

- **Atmospheric Glow:** Instead of black shadows, use "Bloom" effects. Higher elevation elements have a subtle outer glow using the Primary or Secondary color (low opacity, large blur).
- **Glassmorphism:** Secondary surfaces (modals, popovers) use a backdrop blur (12px - 20px) with a 10% white overlay, creating the effect of looking through a frosted cocktail lounge window.
- **Film Grain:** A global, low-opacity (2-3%) noise texture is applied to the top-most layer of the UI to unify the digital elements with a tactile, analog film quality.

## Shapes

The shape language is soft and inviting. Sharp corners are avoided to maintain the "dreamy" aesthetic.

- **Standard Radius:** 0.5rem (8px) for cards and input fields.
- **Large Radius:** 1.5rem (24px) for hero containers and featured sections.
- **Buttons:** Fully rounded (pill-shaped) to provide a soft, tactile interaction point.
- **Icons:** Use thin (1px or 1.5px) stroke weights. Avoid filled icons unless in an active state. Icons should feel like delicate neon wireframes.

## Components

- **Buttons:** 
  - *Primary:* Mia Yellow background, black text, with a subtle outer glow of the same color on hover. 
  - *Secondary:* Transparent with a Sunset Pink thin border.
- **Chips/Tags:** Small, pill-shaped elements with a deep purple semi-transparent background and a 1px border of the same color.
- **Input Fields:** Dark background (darker than the surface color) with a thin bottom-border only, mimicking a classic ledger or vintage form. On focus, the border glows Mia Yellow.
- **Cards:** No harsh borders. Use a subtle gradient background (Twilight Purple to Royal Blue) and a 1px top-light highlight to define the edge.
- **Progress Indicators:** Use a thin, glowing line that moves like a "shooting star" across the top of the container.
- **Lists:** Separated by low-opacity "Sunset Pink" dividers that fade out at the edges.