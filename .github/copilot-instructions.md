# GitHub Copilot Instructions for React Native Development

## Project Overview

This is a React Native application built with Expo. The app follows modern mobile development practices with key features including:
- File-based routing with Expo Router
- Dark mode support with dynamic theming
- Native gestures and haptic feedback
- Offline-first architecture
- Real-time notifications
- Type-safe development

## Technology Stack

- React Native/Expo SDK
- TypeScript
- TailwindCSS/NativeWind
- Expo Router
- Custom UI components
- AsyncStorage
- ExpoHaptics
- Push Notifications

## Development Standards

1. **Code Organization**
   - Components in /components directory
   - Screens in /app directory
   - Utilities in /utils
   - Types in .d.ts files
   - Constants in /constants

2. **Styling**
   - Use TailwindCSS/NativeWind
   - Follow design system guidelines
   - Support dark/light themes
   - Use theme context for dynamic styling

3. **Navigation**
   - Use Expo Router
   - Implement proper navigation patterns
   - Handle deep linking
   - Manage navigation state

4. **Components**
   - Create reusable components
   - Implement proper TypeScript types
   - Use proper prop validation
   - Follow component composition patterns

## Best Practices

1. **Error Boundaries**
   - Implement error boundaries for crash prevention
   - Show user-friendly error messages
   - Log errors appropriately
   - Graceful fallbacks for feature failures

2. **Performance Optimization**
   - Use React.memo for expensive components
   - Implement proper list virtualization
   - Optimize image loading and caching
   - Handle memory management

3. **Native Features**
   - Use native APIs appropriately
   - Handle platform differences
   - Implement proper permissions
   - Support native gestures

## File Structure Guidelines
   ```
   app/
     (tabs)/         # Tab-based screens
     components/     # Reusable components
     constants/      # App constants
     context/       # React context
     hooks/         # Custom hooks
     services/      # API services
   ```

## Common Tasks

1. **Adding New Features**
   - Create necessary components
   - Implement TypeScript interfaces
   - Add navigation routes
   - Create/update services
   - Implement UI components
   - Add proper validation
   - Write tests

2. **State Management**
   - Use React Context appropriately
   - Implement proper data flow
   - Handle offline storage
   - Manage API interactions

3. **Authentication**
   - Handle user login flow
   - Implement secure token storage
   - Manage session persistence
   - Handle authentication errors

## Important Considerations

1. **UI/UX Design**
   - Follow platform-specific design guidelines
   - Implement smooth animations
   - Use appropriate haptic feedback
   - Support both light and dark modes

2. **State Management**
   - Keep component state minimal
   - Use React Context for global state
   - Implement proper data persistence
   - Handle loading and error states

3. **Navigation**
   - Use declarative navigation patterns
   - Handle deep links appropriately
   - Manage navigation state
   - Support screen transitions

4. **Assets and Resources**
   - Optimize image assets
   - Handle fonts and icons efficiently
   - Cache resources appropriately
   - Support different screen sizes