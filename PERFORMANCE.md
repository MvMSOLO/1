# NEXUS Performance Guide

## Performance Budgets
To keep NEXUS light, fast, and immediate, we adhere to the following budgets:

- **Initial HTML/boot**: Under 50ms on edge networks.
- **Initial JS Bundle**: Under 150KB (gzipped).
- **Interactive First Frame**: Target < 100ms.
- **Search Result Display**: Deliver first useful partial result in < 1500ms.

## Performance Anti-patterns Avoided
1. **No Giant Icon Libraries**: We use inline SVGs or fine-grained Lucide icons.
2. **No Heavy Animation Engines**: Micro-interactions rely on CSS transitions/transforms or lightweight Web APIs.
3. **Lazy Loading of Heavy Experiences**: The timeline, comparative table, and research experiences are lazy loaded or bundled separately to avoid bloat on the landing page.
4. **No Background Iframe Preloads**: No third-party resources (such as YouTube, Instagram, etc.) are kept alive or preloaded in the background. Instead, lightweight preconnects and client hints are used.
