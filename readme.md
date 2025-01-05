# KudoSpot Backend

## Overview
KudoSpot's backend is a robust Node.js/Express server that powers the employee recognition platform. It provides secure API endpoints, handles data persistence, and manages user authentication and authorization.

## Features

### 1. Authentication System
- JWT-based authentication
- Secure password hashing with bcrypt
- Token refresh mechanism
- Role-based access control
- Session management

### 2. API Endpoints

#### User Management
```
POST   /api/users/register     # Register new user
POST   /api/users/login        # User login
GET    /api/users/profile      # Get user profile
PUT    /api/users/profile      # Update user profile
GET    /api/users/:id          # Get user by ID
GET    /api/users/leaderboard  # Get user rankings
```

#### Kudos Management
```
POST   /api/kudos             # Create new kudo
GET    /api/kudos             # Get all kudos
GET    /api/kudos/:id         # Get specific kudo
PUT    /api/kudos/:id         # Update kudo
DELETE /api/kudos/:id         # Delete kudo
POST   /api/kudos/:id/like    # Like/unlike kudo
```

#### Statistics
```
GET    /api/stats/user/:id    # Get user statistics
GET    /api/stats/department  # Get department statistics
GET    /api/stats/trending    # Get trending statistics
```

### 3. Database Schema

#### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  department: String,
  bio: String,
  position: String,
  avatar: String,
  level: Number,
  kudosReceived: [Kudo],
  kudosGiven: [Kudo],
  badges: [{
    name: String,
    description: String,
    dateEarned: Date
  }]
}
```

#### Kudo Model
```javascript
{
  from: User,
  to: User,
  message: String,
  category: String,
  likes: [User],
  createdAt: Date,
  updatedAt: Date
}
```

## Technology Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **morgan**: HTTP request logger

## Project Structure

```
server/
├── config/
│   ├── db.js
│   └── default.json
├── middleware/
│   ├── auth.js
│   └── error.js
├── models/
│   ├── User.js
│   └── Kudo.js
├── routes/
│   ├── users.js
│   └── kudos.js
├── utils/
│   └── validation.js
└── server.js
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kudospot.git
cd kudospot/server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `config/default.json` file:
```json
{
  "mongoURI": "kudospot",
  "jwtSecret": "kudospot",
  "jwtExpiration": "24h"
}
```

4. Start the server:
```bash
npm start
```

The server will be running at `http://localhost:5000`.

## API Documentation

### Authentication
All protected routes require a valid JWT token in the request header:
```
Authorization: Bearer <token>
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { ... }
}

// Error Response
{
  "success": false,
  "error": "Error message"
}
```

## Development Guidelines

### Code Style
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Implement proper error handling
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Security Measures
- Input validation and sanitization
- Rate limiting on sensitive routes
- Security headers with helmet
- Password hashing with bcrypt
- JWT token expiration
- CORS configuration

### Error Handling
- Custom error middleware
- Structured error responses
- Proper HTTP status codes
- Detailed error logging
- Error monitoring setup

## Performance Optimization

- Database indexing
- Query optimization
- Caching strategies
- Rate limiting
- Load balancing ready

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

1. Set environment variables
2. Configure MongoDB connection
3. Set up security measures
4. Configure CORS settings
5. Set up process manager (PM2)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.