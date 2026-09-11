# Flow Clock

A modern productivity application for tracking focus sessions, building streaks, and visualizing your work through intuitive activity metrics.

Flow Clock helps students, programmers, readers, and productivity-focused professionals maintain consistent focus habits with real-time session tracking, comprehensive statistics, and streak-based motivation.

## Features

- **Focus Sessions**: Start, pause, and complete tracked work sessions across multiple activity modes (Coding, Study, Reading, Workout, etc.)
- **Streak Tracking**: Maintain daily consistency with current streak tracking, longest streak records, and total active days
- **Session History**: View detailed logs of your completed sessions organized by date
- **Activity Grid**: Visualize your productivity over time with a GitHub-style contribution grid showing intensity of work
- **Statistics Dashboard**: Comprehensive metrics including total focused time, weekly/monthly breakdowns, session counts, and mode-specific analytics
- **Theme System**: Multiple built-in themes with customization support
- **Local-First Storage**: All data stored securely in your browser with no cloud sync required
- **Responsive Design**: Optimized experience across desktop, tablet, and mobile devices

## How It Works

1. **Start a Session**: Select your activity mode and begin a focus session
2. **Track Your Work**: Pause, resume, or complete your session as needed
3. **Minimum Threshold**: Sessions must meet the meaningful duration threshold to count toward your streak (default: 5 minutes)
4. **Build Your Streak**: Complete sessions every day to grow and maintain your streak
5. **Track Progress**: Monitor your total focused time, session count, and activity patterns
6. **Unlock Rewards**: Earn theme unlocks and visual customizations through consistent work

## Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 8
- **State Management**: React Context API
- **Storage**: Browser localStorage
- **Styling**: CSS with theme system
- **Linting**: Oxlint
- **Package Manager**: npm



## Project Structure

```
src/
├── components/          # Reusable UI components (Clock, Timer, Cards, etc.)
├── pages/               # Main application pages (Home, Activity, Settings)
├── context/             # React Context for global state (FlowContext)
├── hooks/               # Custom React hooks (useFlow, useStopwatch, useStats, etc.)
├── services/            # Core services (localStorage persistence, migrations)
├── utils/               # Utility functions (streak calculations, statistics, time formatting)
├── data/                # Static data (theme definitions, default modes)
└── assets/              # Static assets and resources
```

### Architecture Principles

- **Separation of Concerns**: UI components remain independent of business logic
- **Local-First**: All features work offline with localStorage persistence
- **Type Safety**: Validation of stored data during load and migration
- **Performance**: Lightweight implementation without unnecessary dependencies
- **Accessibility**: Keyboard navigation and screen reader support

## Pricing Model

Flow Clock operates on a freemium SaaS model:

### Free Tier
- Unlimited focus sessions
- Full streak tracking
- Complete activity history
- Basic statistics dashboard
- Multiple themes
- Up to 5 custom activity modes
- Local data storage

### Premium Tier (Future)
- Advanced statistics and analytics
- More than 5 custom activity modes
- Additional theme options
- Custom theme uploads
- Enhanced customization features
- Priority feature requests

Premium verification is performed server-side only. Local premium flags exist for development and testing purposes only.

## Data Privacy

Flow Clock prioritizes user privacy:

- **No Cloud Storage**: All data remains on your device in localStorage
- **No Account Required**: Use immediately without signup
- **No Tracking**: No analytics or user tracking
- **No API Calls**: Fully offline-capable after initial load
- **No Backend Dependencies**: Complete data control remains with the user

## Browser Compatibility

Flow Clock works on all modern browsers supporting:
- ES2020 JavaScript
- CSS Grid and Flexbox
- localStorage API
- Fetch API

Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Bundle Size**: Optimized for fast loading
- **No Unnecessary Dependencies**: Only essential packages included
- **Responsive UI**: 60fps animations with respect for prefers-reduced-motion
- **Efficient State Management**: Minimal re-renders through context optimization

## Roadmap

### V1.5 Current Focus
- Improved session validation and tracking
- Enhanced streak protection mechanics
- Comprehensive statistics dashboard
- Activity grid visualization
- Reward unlock system
- Theme expansion
- Performance optimizations

### Future Considerations
- Cross-device synchronization (premium)
- Advanced analytics and insights
- Data export capabilities
- Mobile native applications
- Team/group features (premium)
- API for third-party integrations

## Contributing

Contributions are welcome. Please ensure:
- Code follows existing conventions
- Changes are tested where applicable
- No unnecessary dependencies are added
- Existing functionality remains unaffected
- Error handling is implemented properly

## Error Handling

Flow Clock gracefully handles common issues:

- **Storage Unavailable**: Displays user notification; data persists until tab closes
- **Corrupted Data**: Falls back to safe defaults; original sessions are preserved
- **Migration Failures**: Safe fallback to known good state
- **Component Errors**: Error boundary catches and displays helpful messages

## Future Backend Considerations

When the product needs authentication, cloud sync, or payment processing, the architecture supports backend integration via:

- REST or GraphQL API
- User authentication system
- Database for cross-device sync
- Payment provider integration
- Subscription verification

Current V1.5 requires none of these components.

## License

Check LICENSE file for details.

## Support

For issues, feature requests, or questions, please open an issue in the repository.

---

**Flow Clock**: Focus Today, Achieve Tomorrow
