# AgriSmart Backend API Endpoints

## Authentication Endpoints (Replacing Clerk)

### User Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Role-Based Access
```
GET    /api/auth/roles
POST   /api/auth/assign-role
GET    /api/auth/user-role
```

## User Management

### Profile Management
```
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/avatar
DELETE /api/users/avatar
PUT    /api/users/preferences
```

### User Settings
```
GET    /api/users/settings
PUT    /api/users/settings
PUT    /api/users/notifications
```

## Weather Data (Replacing OpenMeteo)

### Weather Forecasts
```
GET    /api/weather/current
GET    /api/weather/forecast
GET    /api/weather/history
GET    /api/weather/alerts
POST   /api/weather/subscribe-alerts
DELETE /api/weather/unsubscribe-alerts
```

## Market Data (Replacing Data.gov.in)

### Mandi Prices
```
GET    /api/market/prices
GET    /api/market/prices/:commodity
GET    /api/market/prices/history
GET    /api/market/trends
GET    /api/market/analysis
```

### Market Intelligence
```
GET    /api/market/insights
GET    /api/market/recommendations
POST   /api/market/price-alerts
DELETE /api/market/price-alerts
```

## Knowledge & Content Management

### Articles & Guides
```
GET    /api/knowledge/articles
GET    /api/knowledge/articles/:id
POST   /api/knowledge/articles
PUT    /api/knowledge/articles/:id
DELETE /api/knowledge/articles/:id
```

### Government Schemes
```
GET    /api/schemes
GET    /api/schemes/:id
GET    /api/schemes/eligibility
POST   /api/schemes/apply
```

### Categories & Tags
```
GET    /api/knowledge/categories
GET    /api/knowledge/tags
POST   /api/knowledge/search
```

## Gamification System

### User Progress
```
GET    /api/gamification/progress
PUT    /api/gamification/progress
GET    /api/gamification/leaderboard
GET    /api/gamification/stats
```

### Achievements
```
GET    /api/gamification/achievements
GET    /api/gamification/achievements/:id
POST   /api/gamification/achievements/unlock
GET    /api/gamification/user-achievements
```

### Points & Rewards
```
POST   /api/gamification/earn-points
GET    /api/gamification/rewards
POST   /api/gamification/redeem-reward
```

## AI Suggestions (Replacing Gemini)

### Farming Recommendations
```
GET    /api/ai/suggestions
GET    /api/ai/suggestions/:type
POST   /api/ai/analyze-crop
POST   /api/ai/predict-yield
POST   /api/ai/optimize-irrigation
POST   /api/ai/disease-detection
```

### Personalized Advice
```
GET    /api/ai/personalized
POST   /api/ai/feedback
GET    /api/ai/history
```

## Community Features

### Posts & Discussions
```
GET    /api/community/posts
GET    /api/community/posts/:id
POST   /api/community/posts
PUT    /api/community/posts/:id
DELETE /api/community/posts/:id
```

### Comments & Interactions
```
GET    /api/community/posts/:id/comments
POST   /api/community/posts/:id/comments
PUT    /api/community/comments/:id
DELETE /api/community/comments/:id
POST   /api/community/posts/:id/like
DELETE /api/community/posts/:id/like
```

### User Interactions
```
GET    /api/community/user-activity
GET    /api/community/following
POST   /api/community/follow/:userId
DELETE /api/community/unfollow/:userId
```

## Marketplace

### Product Listings
```
GET    /api/marketplace/products
GET    /api/marketplace/products/:id
POST   /api/marketplace/products
PUT    /api/marketplace/products/:id
DELETE /api/marketplace/products/:id
```

### Categories & Search
```
GET    /api/marketplace/categories
GET    /api/marketplace/search
GET    /api/marketplace/featured
```

### Transactions
```
POST   /api/marketplace/buy
GET    /api/marketplace/orders
GET    /api/marketplace/orders/:id
PUT    /api/marketplace/orders/:id/status
```

## Notifications System

### Push Notifications
```
GET    /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
POST   /api/notifications/mark-all-read
```

### Notification Preferences
```
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
POST   /api/notifications/test
```

### System Alerts
```
POST   /api/notifications/alerts
GET    /api/notifications/alerts
PUT    /api/notifications/alerts/:id
```

## File Upload & Media

### File Management
```
POST   /api/upload/image
POST   /api/upload/document
DELETE /api/upload/:fileId
GET    /api/upload/:fileId
```

## Analytics & Reporting

### User Analytics
```
GET    /api/analytics/user-activity
GET    /api/analytics/usage-stats
GET    /api/analytics/engagement
```

### System Analytics
```
GET    /api/analytics/system-health
GET    /api/analytics/performance
GET    /api/analytics/errors
```

## Admin Panel

### User Management
```
GET    /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST    /api/admin/users/:id/ban
```

### Content Moderation
```
GET    /api/admin/content
PUT    /api/admin/content/:id/status
DELETE /api/admin/content/:id
```

### System Settings
```
GET    /api/admin/settings
PUT    /api/admin/settings
GET    /api/admin/logs
```

## Data Synchronization

### External API Sync
```
POST   /api/sync/weather
POST   /api/sync/market-data
POST   /api/sync/government-data
GET    /api/sync/status
```

## Health Checks

### System Health
```
GET    /api/health
GET    /api/health/database
GET    /api/health/external-apis
GET    /api/health/cache
```

---

## Priority Implementation Order

### Phase 1: Core Authentication & User Management
1. `/api/auth/*` - User authentication and authorization
2. `/api/users/*` - Profile and settings management

### Phase 2: Essential Data Services
1. `/api/weather/*` - Weather data and alerts
2. `/api/market/*` - Market prices and analysis
3. `/api/knowledge/*` - Articles and guides

### Phase 3: Interactive Features
1. `/api/gamification/*` - User progress and achievements
2. `/api/ai/*` - AI-powered suggestions
3. `/api/community/*` - Social features

### Phase 4: Commerce & Advanced Features
1. `/api/marketplace/*` - Product listings and transactions
2. `/api/notifications/*` - Notification system
3. `/api/admin/*` - Administrative functions

### Phase 5: Optimization & Analytics
1. `/api/analytics/*` - Usage analytics
2. `/api/sync/*` - Data synchronization
3. `/api/health/*` - System monitoring