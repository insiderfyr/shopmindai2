# Modern Sidebar Component

## Overview

A modern, minimalist sidebar component with hover expansion functionality, designed specifically for the ShopMindAI application. The sidebar automatically adapts to different screen sizes and provides an intuitive navigation experience.

## Features

### 🎨 **Design & Layout**
- **Position**: Fixed on the left side of the screen
- **Width**: 80px when collapsed, expands to 256px on hover/click
- **Background**: Light gray (#f5f5f5) with modern styling
- **Style**: Minimalist design with rounded corners for all elements
- **Responsive**: Automatically adapts to mobile and tablet layouts

### 🚀 **Functionality**
- **Hover Expansion**: Automatically expands on hover
- **Auto-collapse**: Collapses after 300ms delay when mouse leaves
- **Smooth Animations**: 300ms transitions with cubic-bezier easing
- **Touch Support**: Optimized for mobile devices
- **Keyboard Navigation**: Full accessibility support

### 📱 **Responsive Design**
- **Mobile**: Full-width horizontal layout
- **Tablet**: Adaptive sizing with touch optimizations
- **Desktop**: Fixed left sidebar with hover expansion

## Usage

### Basic Implementation

```tsx
import Sidebar from '~/components/Sidebar';

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64">
        {/* Your main content */}
      </main>
    </div>
  );
}
```

### With Custom Styling

```tsx
<Sidebar className="custom-sidebar" />
```

## Component Structure

### Navigation Items
The sidebar includes the following navigation items:

- **Home** - Main dashboard
- **New Chat** - Create new conversation
- **Conversations** - Chat history with badge count
- **Bookmarks** - Saved items
- **Files** - File management
- **Tools** - Additional utilities

### Bottom Items
- **Search** - Global search functionality
- **Settings** - Application settings
- **Profile** - User profile management

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

## CSS Classes

### Main Container
- `.sidebar-container` - Main sidebar container
- `.sidebar-expanded` - Applied when sidebar is expanded

### Navigation Items
- `.sidebar-item` - Individual navigation item
- `.sidebar-item.active` - Active state styling
- `.sidebar-icon` - Icon container with animations
- `.sidebar-text` - Text label with reveal animation
- `.sidebar-badge` - Badge with pulse animation

### Special Elements
- `.sidebar-logo` - Logo with hover effects
- `.sidebar-expand-indicator` - Right edge indicator

## Styling Customization

### Color Scheme
```css
:root {
  --sidebar-bg: #f5f5f5;
  --sidebar-border: #e5e7eb;
  --sidebar-hover: rgba(255, 255, 255, 0.6);
  --sidebar-active: rgba(255, 255, 255, 0.8);
  --sidebar-text: #374151;
  --sidebar-icon: #6b7280;
}
```

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --sidebar-bg: #1f2937;
    --sidebar-border: #374151;
    --sidebar-hover: rgba(55, 65, 81, 0.8);
    --sidebar-active: rgba(59, 130, 246, 0.2);
    --sidebar-text: #d1d5db;
    --sidebar-icon: #9ca3af;
  }
}
```

## Animation Details

### Expansion Animation
- **Duration**: 300ms
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Properties**: width, opacity, transform

### Hover Effects
- **Icon Scale**: 1.1x on hover
- **Background**: Smooth color transitions
- **Shadows**: Dynamic shadow effects

### Text Reveal
- **Initial State**: Hidden with translateX(-10px)
- **Final State**: Visible with translateX(0)
- **Transition**: 300ms ease

## Accessibility Features

### ♿ **Keyboard Navigation**
- Full tab navigation support
- Enter/Space key activation
- Focus indicators with high contrast

### 🎯 **Touch Optimization**
- Minimum 44px touch targets
- Haptic feedback ready
- Touch-friendly spacing

### 🌐 **Screen Reader Support**
- Proper ARIA labels
- Semantic HTML structure
- State announcements

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Legacy Support**: IE 11+ (with polyfills)

## Performance Optimizations

### 🚀 **Efficient Rendering**
- Conditional rendering for expanded state
- Optimized re-renders with useCallback
- Lazy loading for non-critical elements

### 🎨 **Smooth Animations**
- Hardware-accelerated transitions
- Reduced motion support
- 60fps optimization

## Mobile Responsiveness

### 📱 **Mobile Layout**
- Full-width horizontal navigation
- Touch-optimized interactions
- Landscape orientation support

### 💻 **Tablet Layout**
- Adaptive sizing
- Touch and mouse support
- Balanced spacing

## Customization Examples

### Custom Navigation Items
```tsx
const customItems = [
  {
    id: 'custom',
    icon: <CustomIcon />,
    label: 'Custom Item',
    onClick: () => console.log('Custom clicked')
  }
];
```

### Custom Styling
```css
.custom-sidebar {
  --sidebar-bg: #your-color;
  --sidebar-border: #your-border-color;
}
```

## Troubleshooting

### Common Issues

1. **Sidebar not expanding on hover**
   - Check if CSS is loaded
   - Verify mouse events are working
   - Check for conflicting z-index values

2. **Animations not smooth**
   - Verify hardware acceleration is enabled
   - Check for conflicting CSS transitions
   - Test on different devices

3. **Mobile layout issues**
   - Test on actual mobile devices
   - Check viewport meta tag
   - Verify CSS media queries

### Debug Mode
```tsx
const [isExpanded, setIsExpanded] = useState(false);
console.log('Sidebar expanded:', isExpanded);
```

## Future Enhancements

- [ ] **Gesture Support**: Swipe navigation
- [ ] **Custom Themes**: Multiple color schemes
- [ ] **Advanced Animations**: Lottie, Framer Motion
- [ ] **Drag & Drop**: Reorderable navigation items
- [ ] **Search Integration**: Inline search functionality
- [ ] **Notifications**: Real-time updates and badges

## Contributing

When contributing to the sidebar component:

1. **Mobile-First**: Always design for mobile first
2. **Accessibility**: Ensure WCAG 2.1 AA compliance
3. **Performance**: Test on low-end devices
4. **Animation**: Respect reduced motion preferences
5. **Testing**: Test on multiple devices and browsers

## License

This component is part of the ShopMindAI project and follows the project's licensing terms.
