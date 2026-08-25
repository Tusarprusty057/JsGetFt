# FitTribe2 - AI-Powered Fitness Application

A comprehensive fitness tracking application with AI-powered features for food detection, posture analysis, and personalized recommendations.

## 🚀 Features

### Core Fitness Tracking
- **Workouts**: Track various workout types (strength, cardio, HIIT, yoga, etc.)
- **Nutrition**: Log meals with AI-powered food recognition and nutritional analysis
- **Health Metrics**: Monitor sleep, heart rate, stress, steps, body measurements
- **Progress Tracking**: Set goals, track achievements, and visualize progress

### AI-Powered Features
- **Food Recognition**: Take photos of food to get instant nutritional analysis
- **Posture Analysis**: AI-driven exercise form evaluation with real-time feedback
- **Personalized Recommendations**: AI-generated workout and nutrition suggestions
- **Smart Analytics**: Intelligent insights based on your data and goals

### Social & Gamification
- **Social Features**: Connect with friends, share achievements, join challenges
- **Gamification**: Earn badges, level up, maintain streaks
- **Challenges**: Individual and group fitness competitions
- **Leaderboards**: Compete with friends and community

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image storage
- **OpenAI API** for AI features
- **Google Vision API** for food detection

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **React Query** for data fetching
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Heroicons** for icons

## 📋 Prerequisites

Before running the application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FitTribe2
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/fittribe2
# Alternative: MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fittribe2

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically create the database

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file

### 5. AI Services Setup

#### OpenAI API
1. Create an account at [OpenAI](https://openai.com)
2. Generate an API key
3. Add it to your `.env` file

#### Google Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Vision API
3. Create credentials and get your API key
4. Add it to your `.env` file

#### Cloudinary (Optional)
1. Create a [Cloudinary](https://cloudinary.com) account
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

## 🚀 Running the Application

### Development Mode

#### Start Backend Server
```bash
npm run server
```

#### Start Frontend (in a new terminal)
```bash
npm run client
```

#### Start Both (recommended)
```bash
npm run dev
```

### Production Mode

#### Build Frontend
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🗂 Project Structure

```
FitTribe2/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── index.js            # Server entry point
├── package.json            # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Workouts
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts` - Create workout
- `GET /api/workouts/:id` - Get workout details
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Nutrition
- `GET /api/nutrition/meals` - Get user meals
- `POST /api/nutrition/meals` - Create meal
- `GET /api/nutrition/foods` - Search food items
- `POST /api/nutrition/foods` - Create food item

### Health
- `GET /api/health/dashboard` - Get health dashboard
- `POST /api/health/measurements` - Add body measurement
- `POST /api/health/sleep` - Add sleep record
- `POST /api/health/heartrate` - Add heart rate record

### AI Features
- `POST /api/ai/food-detection` - Analyze food from image
- `POST /api/ai/posture-analysis` - Analyze exercise posture
- `POST /api/ai/nutrition-analysis` - Analyze nutrition from text
- `POST /api/ai/personalized-recommendations` - Get AI recommendations

## 🎯 Key Features Implementation

### 1. AI Food Detection
- Upload food images
- Google Vision API for object detection
- OpenAI for nutritional analysis
- Health score calculation
- Alternative food suggestions

### 2. Posture Analysis
- Upload workout videos/images
- AI-powered form analysis
- Real-time feedback
- Safety warnings and tips

### 3. Personalized Recommendations
- User profile analysis
- Goal-based suggestions
- Adaptive recommendations
- Progress tracking

### 4. Gamification
- Experience points system
- Badge and achievement system
- Streak tracking
- Social challenges

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers

## 📊 Database Schema

### User Model
- Personal information (age, gender, weight, height)
- Fitness goals and preferences
- Gamification data (level, points, badges)
- Social connections
- AI profile and preferences

### Workout Model
- Exercise details and sets
- Performance metrics
- AI analysis results
- Social features (likes, shares, comments)

### Nutrition Model
- Food items with nutritional data
- Meal tracking
- AI analysis and recommendations
- Hydration tracking

### Health Model
- Body measurements
- Sleep tracking
- Heart rate monitoring
- Stress level tracking
- Steps and activity data

## 🚀 Deployment

### Environment Variables for Production
Make sure to set all required environment variables in your production environment:

- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `GOOGLE_VISION_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NODE_ENV=production`

### Recommended Hosting Platforms
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎉 Acknowledgments

- OpenAI for AI capabilities
- Google Vision API for image recognition
- React and Node.js communities
- All open-source libraries used

---

**Happy Fitness Tracking! 💪**
