# Moody - AI-Powered Mood Tracking App

Moody is a privacy-first mood tracking web application that uses facial expression analysis to estimate emotional states and provides personalized insights through interactive dashboards.

## 🌟 Features

### Core Functionality
- **Selfie-Based Mood Analysis**: Capture selfies and get instant mood analysis
- **Privacy-First Design**: Images are processed locally and never stored
- **Comprehensive Metrics**: Track happiness, stress, valence, and arousal levels
- **Interactive Trends**: Visualize mood patterns over daily, weekly, and monthly periods
- **Data Export**: Download your data in JSON or CSV format
- **Account Management**: Full control over your data with delete functionality

### Privacy & Security
- ✅ **No Image Storage**: Photos are processed client-side and immediately discarded
- ✅ **Derived Features Only**: Only numerical mood metrics are stored
- ✅ **Explicit Consent**: Clear consent flow explaining data processing
- ✅ **Data Portability**: Export your data anytime in multiple formats
- ✅ **Right to Delete**: Complete data deletion with one click
- ✅ **Secure Authentication**: JWT-based authentication with bcrypt password hashing

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Analysis**: Client-side facial expression analysis using face-api.js
- **Interactive Charts**: Beautiful trend visualization with Chart.js
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS
- **Type Safety**: Full TypeScript implementation for both frontend and backend

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom component classes
- **Routing**: React Router for client-side navigation
- **State Management**: React Context for authentication state
- **Charts**: Chart.js with React wrapper for trend visualization
- **AI Processing**: face-api.js for client-side facial expression analysis

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express server
- **Language**: TypeScript for type safety
- **Database**: SQLite for simple deployment and development
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, and input validation
- **API Design**: RESTful API with proper error handling

### Database Schema
```sql
-- Users table
users (
  id, email, password_hash, created_at, 
  has_consented, consent_date
)

-- Mood entries (only derived features, no images)
mood_entries (
  id, user_id, happiness, stress, valence, 
  arousal, confidence, created_at
)

-- User settings
user_settings (
  id, user_id, data_retention_days, 
  export_format, created_at, updated_at
)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arnabmandal137/moody.git
   cd moody
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Setup environment variables**
   ```bash
   # In backend directory, create .env file
   echo "JWT_SECRET=your-super-secure-secret-key-here" > .env
   echo "PORT=3001" >> .env
   
   # In frontend directory, create .env file
   echo "VITE_API_URL=http://localhost:3001" > .env
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will start on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will start on http://localhost:5173

3. **Access the application**
   Open your browser to http://localhost:5173

### Production Build

1. **Build the backend**
   ```bash
   cd backend
   npm run build
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Start production server**
   ```bash
   cd backend
   npm start
   ```

## 📱 Usage

### Getting Started
1. **Create Account**: Register with email and password
2. **Review Consent**: Read and accept the privacy terms
3. **Capture Mood**: Use the camera to take a selfie
4. **View Analysis**: See your mood analysis results
5. **Track Trends**: Monitor your mood patterns over time

### Mood Metrics Explained
- **Happiness**: Level of positive emotion (0-100%)
- **Stress**: Level of stress indicators (0-100%)
- **Valence**: Emotional positivity (-100% to +100%)
- **Arousal**: Emotional intensity/energy (0-100%)

### Privacy Features
- **Data Export**: Download all your data from Settings
- **Account Deletion**: Permanently delete your account and all data
- **No Image Storage**: Your photos are never saved or transmitted

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests (when implemented)
```bash
cd frontend
npm test
```

### Test Coverage
- Authentication flow (register, login)
- Mood entry creation and retrieval
- Trend analysis calculations
- Data export functionality
- User data deletion

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user

### Mood Tracking Endpoints
- `POST /api/mood/entries` - Create mood entry
- `GET /api/mood/entries` - Get mood entries (paginated)
- `GET /api/mood/trends/:period` - Get trend data
- `DELETE /api/mood/entries/:id` - Delete mood entry

### User Management Endpoints
- `GET /api/user/profile` - Get user profile
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/export` - Export user data
- `DELETE /api/user/data` - Delete all user data

## 🛡️ Security Considerations

### Data Privacy
- **Local Processing**: Facial analysis happens in the browser
- **No Image Storage**: Photos are never sent to or stored on servers
- **Minimal Data**: Only numerical mood metrics are stored
- **User Control**: Complete data portability and deletion rights

### Security Measures
- **Authentication**: JWT tokens with secure secret rotation
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Joi schema validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configured for specific frontend origin
- **Headers**: Helmet.js for security headers

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to:
- Report bugs
- Suggest features
- Submit pull requests

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Maintain privacy-first principles
- Keep the UI accessible and responsive

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **face-api.js** - Client-side facial expression analysis
- **Chart.js** - Beautiful data visualization
- **Tailwind CSS** - Utility-first CSS framework
- **Express.js** - Fast, minimalist web framework
- **React** - Library for building user interfaces

## 📞 Support

For support, email support@moody-app.com or open an issue on GitHub.

---

**Built with ❤️ for privacy-conscious mood tracking**