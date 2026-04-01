# 🎨 OmniFlow - Brand Identity Guide

## Brand Overview

**OmniFlow** is an enterprise-grade data import platform that combines professional reliability with cutting-edge AI technology. The brand conveys trust, sophistication, and innovation.

---

## Brand Name

### Primary Name
**OmniFlow**

### Tagline
"Enterprise Data Import Platform"

### Alternative Taglines
- "Transform Your Data Workflow"
- "Enterprise-Grade Data Intelligence"
- "Seamless Data Integration"

---

## Color Palette

### Primary Colors

**Indigo** (Primary Brand Color)
- Hex: `#6366F1`
- RGB: `rgb(99, 102, 241)`
- Usage: Primary buttons, headers, key UI elements

**Violet** (Secondary Brand Color)
- Hex: `#8B5CF6`
- RGB: `rgb(139, 92, 246)`
- Usage: Gradients, accents, secondary elements

### Accent Colors

**Amber** (Highlight)
- Hex: `#FCD34D`
- RGB: `rgb(252, 211, 77)`
- Usage: Sparkles, highlights, success states

**Emerald** (Success)
- Hex: `#10B981`
- RGB: `rgb(16, 185, 129)`
- Usage: Success messages, positive indicators

**Slate** (Neutral)
- Hex: `#1E293B` (Dark)
- Hex: `#64748B` (Medium)
- Hex: `#F1F5F9` (Light)
- Usage: Text, backgrounds, borders

---

## Typography

### Font Family
**System Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Font Weights
- **Black (900)**: Main headings, brand name
- **Bold (700)**: Subheadings, buttons
- **Semibold (600)**: Labels, emphasis
- **Medium (500)**: Body text
- **Regular (400)**: Secondary text

### Font Sizes
- **Hero**: 7xl-8xl (72px-96px)
- **H1**: 5xl-6xl (48px-60px)
- **H2**: 3xl-4xl (30px-36px)
- **H3**: 2xl (24px)
- **Body**: lg-xl (18px-20px)
- **Small**: sm-base (14px-16px)

---

## Logo

### Primary Logo
- **File**: `public/logo.svg`
- **Format**: SVG (scalable)
- **Dimensions**: 200x200px (base)
- **Style**: Gradient database icon with flow arrows

### Logo Elements
1. **Background**: Indigo to Violet gradient
2. **Icon**: White database cylinder with data lines
3. **Flow Arrows**: Amber arrows showing data flow
4. **Sparkles**: Amber accent dots

### Logo Usage
- **Minimum Size**: 32x32px
- **Clear Space**: 8px on all sides
- **Background**: Works on dark and light backgrounds
- **Variations**: 
  - Full color (primary)
  - White (on dark backgrounds)
  - Monochrome (when needed)

### Logo Don'ts
- ❌ Don't stretch or distort
- ❌ Don't change colors arbitrarily
- ❌ Don't add effects (shadows, outlines)
- ❌ Don't place on busy backgrounds

---

## UI Components

### Buttons

**Primary Button**
```css
background: linear-gradient(to right, #6366F1, #8B5CF6);
color: white;
border-radius: 1.5rem;
padding: 1.5rem 2.5rem;
font-weight: 900;
```

**Secondary Button**
```css
background: white;
color: #1E293B;
border-radius: 1.5rem;
padding: 1.5rem 2.5rem;
font-weight: 900;
```

### Cards
```css
background: white;
border-radius: 2rem;
padding: 2rem;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
border: 1px solid #E2E8F0;
```

### Badges
```css
background: rgba(99, 102, 241, 0.1);
border: 1px solid rgba(99, 102, 241, 0.2);
border-radius: 9999px;
padding: 0.375rem 1.25rem;
font-size: 0.625rem;
font-weight: 900;
text-transform: uppercase;
letter-spacing: 0.1em;
```

---

## Gradients

### Primary Gradient
```css
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
```

### Background Gradient
```css
background: linear-gradient(to bottom right, 
  #0F172A, #1E3A8A, #6B21A8);
```

### Text Gradient
```css
background: linear-gradient(to right, #6366F1, #8B5CF6);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Animations

### Hover Effects
- **Scale**: `transform: scale(1.05)`
- **Shadow**: Increase shadow on hover
- **Transition**: `transition: all 0.3s ease`

### Loading States
- **Pulse**: Opacity animation for loading
- **Spin**: Rotation for spinners
- **Slide**: Slide-in animations for content

### Micro-interactions
- **Button Press**: `scale(0.95)` on active
- **Sparkle**: Pulse animation on accent elements
- **Blob**: Floating animation on background elements

---

## Voice & Tone

### Brand Voice
- **Professional**: Enterprise-grade, reliable
- **Innovative**: Cutting-edge AI technology
- **Approachable**: User-friendly, helpful
- **Confident**: Expert in data management

### Writing Style
- Use active voice
- Be concise and clear
- Avoid jargon when possible
- Use technical terms when appropriate
- Focus on benefits, not just features

### Example Copy

**Good:**
> "Transform your data workflow with AI-powered validation and seamless integration across 15+ databases."

**Avoid:**
> "Our system uses advanced algorithms to process your CSV files and stuff."

---

## Messaging

### Key Messages

1. **Enterprise-Grade Reliability**
   - Professional-grade platform
   - Trusted by businesses
   - Secure and compliant

2. **AI-Powered Intelligence**
   - Smart data cleaning
   - Automatic validation
   - Intelligent field mapping

3. **Seamless Integration**
   - 15+ database support
   - Easy setup
   - No coding required

4. **Privacy-First**
   - Runs in browser
   - No data sent to servers
   - 100% private

---

## Use Cases

### Target Audience
- **Data Analysts**: Import and clean datasets
- **Developers**: Integrate data pipelines
- **Business Users**: Manage data workflows
- **Enterprises**: Large-scale data operations

### Industry Applications
- E-commerce (product imports)
- Healthcare (patient data)
- Finance (transaction records)
- Education (student information)
- Marketing (customer data)

---

## Social Media

### Profile Images
- Use primary logo (SVG)
- Ensure visibility at small sizes
- Maintain brand colors

### Cover Images
- Feature gradient background
- Include tagline
- Show platform screenshots

### Post Style
- Professional yet approachable
- Use brand colors in graphics
- Include relevant emojis sparingly
- Focus on value and benefits

---

## File Naming

### Consistency
- Use kebab-case: `OmniFlow-pro-logo.svg`
- Include version: `OmniFlow-pro-logo-v1.svg`
- Specify variant: `OmniFlow-pro-logo-white.svg`

### Organization
```
/branding
  /logos
    - OmniFlow-pro-logo.svg
    - OmniFlow-pro-logo-white.svg
    - OmniFlow-pro-icon.svg
  /colors
    - color-palette.png
  /screenshots
    - homepage-screenshot.png
    - dashboard-screenshot.png
```

---

## Brand Evolution

### Version History
- **v1.0** (Current): OmniFlow launch
  - Indigo/Violet color scheme
  - Database flow icon
  - Enterprise positioning

### Future Considerations
- Dark mode variations
- Mobile app branding
- Print materials
- Merchandise

---

## Contact

For brand guidelines questions or asset requests:
- Email: brand@OmniFlowpro.com
- Website: https://OmniFlowpro.com

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Active

---

**Built with ❤️ for enterprise data management**
