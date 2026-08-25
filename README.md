# JsGetFt - AI-Powered Fitness Tracking Application

Welcome to **JsGetFt**! 💪

JsGetFt is a modern fitness tracking application designed to help users manage their workouts, nutrition, health data, and fitness progress in one place.

The app also includes AI-powered features for things like food recognition, posture analysis, nutrition insights, and personalized fitness recommendations.

Whether you're tracking your daily workout, logging meals, monitoring your health, or competing in fitness challenges, **JsGetFt brings everything together in one simple platform**.

## 🚀 Features

### 💪 Fitness Tracking

JsGetFt helps users keep track of their complete fitness journey.

* **Workouts** – Track strength training, cardio, HIIT, yoga, and other activities
* **Nutrition** – Log meals and analyze food with AI-powered recognition
* **Health Metrics** – Monitor sleep, heart rate, stress, steps, and body measurements
* **Progress Tracking** – Set goals, unlock achievements, and track your progress over time

### 🤖 AI-Powered Features

AI is used to make fitness tracking smarter and more personalized.

* **Food Recognition** – Upload or capture a food image to get nutritional information
* **Posture Analysis** – Analyze exercise form and receive feedback
* **Personalized Recommendations** – Get workout and nutrition suggestions based on your goals
* **Smart Analytics** – Receive useful insights from your fitness and health data

### 🏆 Social & Gamification

Fitness is more fun when you can stay motivated and compete with others.

* Connect with friends
* Share fitness achievements
* Join individual or group challenges
* Earn badges and experience points
* Maintain workout streaks
* Level up your profile
* Compete on leaderboards

---

# 🛠 Technology Stack

## Backend

The backend is built using:

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT** for authentication
* **bcrypt** for password hashing
* **Cloudinary** for image storage
* **OpenAI API** for AI-powered features
* **Google Vision API** for food and image recognition

## Frontend

The frontend uses:

* **React 18**
* Functional components and React Hooks
* **React Router** for navigation
* **React Query** for API and data fetching
* **Framer Motion** for animations
* **Tailwind CSS** for styling
* **Heroicons** for icons

---

# 📋 Prerequisites

Before running JsGetFt, make sure you have the following installed:

* **Node.js** version 16 or higher
* **MongoDB** locally, or a MongoDB Atlas account
* **npm** or **yarn**

You will also need API credentials if you want to use the AI and image-related features.

---

# 🔧 Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Tusarprusty057/JsGetFt.git
cd JsGetFt
```

## 2. Install Dependencies

### Backend Dependencies

From the root directory:

```bash
npm install
```

### Frontend Dependencies

```bash
cd client
npm install
cd ..
```

---

# ⚙️ Environment Configuration

Create a `.env` file in the root directory and add the following:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jsgetft

# Alternative: MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jsgetft

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary - Image Uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000
```

> Keep your `.env` file private and never upload API keys or secrets to GitHub.

---

# 🗄️ Database Setup

You can use either a local MongoDB installation or MongoDB Atlas.

## Option A: Local MongoDB

1. Install MongoDB on your system.
2. Start the MongoDB service.
3. Use the local connection string in your `.env` file.
4. The application will create and use the database automatically.

Example:

```env
MONGODB_URI=mongodb://localhost:27017/jsgetft
```

## Option B: MongoDB Atlas

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Get the MongoDB connection string.
5. Add the connection string to `MONGODB_URI`.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jsgetft
```

---

# 🤖 AI Services Setup

## OpenAI API

OpenAI is used for AI-powered features such as nutrition analysis and personalized recommendations.

1. Create an account with OpenAI.
2. Generate an API key.
3. Add the key to your `.env` file.

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Google Vision API

Google Vision is used for image and food recognition.

1. Open Google Cloud Console.
2. Create or select a project.
3. Enable the Vision API.
4. Create the required credentials.
5. Add your API key to `.env`.

```env
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
```

## Cloudinary

Cloudinary is used for uploading and storing images.

1. Create a Cloudinary account.
2. Get your cloud name, API key, and API secret.
3. Add them to the `.env` file.

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

# 🚀 Running JsGetFt

## Development Mode

### Start the Backend

```bash
npm run server
```

### Start the Frontend

Open another terminal and run:

```bash
npm run client
```

### Start Both Together

The easiest option is:

```bash
npm run dev
```

This starts both the frontend and backend development servers.

---

# 📦 Production Mode

## Build the Frontend

```bash
npm run build
```

## Start the Production Server

```bash
npm start
```

Make sure all production environment variables are configured before deploying.

---

# 📱 Application URLs

When running locally, the application should be available at:

* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`
* **Health Check:** `http://localhost:5000/api/health`

---

# 🗂 Project Structure

```text
JsGetFt/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Application pages
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Frontend entry point
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── models/             # MongoDB database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── index.js            # Backend entry point
│
├── package.json
└── README.md
```

---

# 🔌 API Endpoints

## 🔐 Authentication

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Login a user            |
| GET    | `/api/auth/me`       | Get the current user    |
| PUT    | `/api/auth/me`       | Update the user profile |

---

## 💪 Workouts

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| GET    | `/api/workouts`     | Get user workouts    |
| POST   | `/api/workouts`     | Create a new workout |
| GET    | `/api/workouts/:id` | Get workout details  |
| PUT    | `/api/workouts/:id` | Update a workout     |
| DELETE | `/api/workouts/:id` | Delete a workout     |

---

## 🍎 Nutrition

| Method | Endpoint               | Description        |
| ------ | ---------------------- | ------------------ |
| GET    | `/api/nutrition/meals` | Get user meals     |
| POST   | `/api/nutrition/meals` | Create a meal      |
| GET    | `/api/nutrition/foods` | Search food items  |
| POST   | `/api/nutrition/foods` | Create a food item |

---

## ❤️ Health

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| GET    | `/api/health/dashboard`    | Get health dashboard data |
| POST   | `/api/health/measurements` | Add body measurements     |
| POST   | `/api/health/sleep`        | Add a sleep record        |
| POST   | `/api/health/heartrate`    | Add a heart rate record   |

---

## 🤖 AI Features

| Method | Endpoint                               | Description                      |
| ------ | -------------------------------------- | -------------------------------- |
| POST   | `/api/ai/food-detection`               | Analyze food from an image       |
| POST   | `/api/ai/posture-analysis`             | Analyze exercise posture         |
| POST   | `/api/ai/nutrition-analysis`           | Analyze nutrition from text      |
| POST   | `/api/ai/personalized-recommendations` | Get personalized recommendations |

---

# 🎯 Main Feature Details

## 🍽️ 1. AI Food Detection

The food detection feature makes meal tracking easier.

It can:

* Accept uploaded food images
* Detect food objects using Google Vision
* Analyze nutritional information with AI
* Calculate a health score
* Suggest alternative or healthier food options

---

## 🏋️ 2. Posture Analysis

Users can upload workout images or videos for exercise form analysis.

The system can provide:

* AI-powered posture and form analysis
* Feedback about exercise technique
* Real-time feedback where supported
* Safety warnings
* Tips for improving form

This feature is designed to help users understand and improve their exercise technique.

---

## 🧠 3. Personalized Recommendations

Recommendations are generated based on user data and fitness goals.

The system can consider:

* User profile information
* Fitness goals
* Workout history
* Nutrition information
* Health data
* Progress over time

Based on this information, JsGetFt can provide personalized workout and nutrition suggestions.

---

## 🏆 4. Gamification

JsGetFt includes gamification features to help users stay motivated.

Features include:

* Experience points
* User levels
* Badges
* Achievements
* Workout streaks
* Fitness challenges
* Group competitions
* Social leaderboards

---

# 🔒 Security Features

Security is an important part of the application.

JsGetFt includes:

* JWT-based authentication
* Password hashing with bcrypt
* Input validation
* Input sanitization
* Rate limiting
* CORS configuration
* Helmet.js security headers
* Protected routes and authenticated API access

Sensitive values such as API keys, database credentials, and JWT secrets should always be stored in environment variables.

---

# 📊 Database Structure

## 👤 User Model

The user model stores information such as:

* Personal details
* Age
* Gender
* Weight
* Height
* Fitness goals
* Fitness preferences
* Level and experience points
* Badges and achievements
* Social connections
* AI preferences and profile data

---

## 💪 Workout Model

Workout records can contain:

* Workout details
* Exercise information
* Sets and repetitions
* Performance metrics
* AI analysis results
* Likes
* Shares
* Comments and social activity

---

## 🍎 Nutrition Model

Nutrition-related data can include:

* Food items
* Nutritional information
* Meal records
* AI nutrition analysis
* Personalized food recommendations
* Hydration tracking

---

## ❤️ Health Model

Health tracking can include:

* Body measurements
* Sleep records
* Heart rate data
* Stress levels
* Daily steps
* General activity information

---

# 🌐 Deployment

Before deploying JsGetFt, make sure all required environment variables are properly configured.

## Production Environment Variables

```env
MONGODB_URI=your_production_database_url
JWT_SECRET=your_production_jwt_secret
OPENAI_API_KEY=your_openai_api_key
GOOGLE_VISION_API_KEY=your_google_vision_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=production
```

## Recommended Deployment Setup

### Backend

You can deploy the backend on platforms such as:

* Railway
* DigitalOcean
* AWS
* Heroku or similar Node.js hosting services

### Frontend

The React frontend can be deployed on:

* Vercel
* Netlify
* AWS S3 with CloudFront

### Database

For the database, MongoDB Atlas is a convenient option for a hosted MongoDB setup.

---

# 🤝 Contributing

Contributions are welcome!

If you want to improve JsGetFt:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Add tests if needed.
5. Commit your changes.
6. Push the branch.
7. Create a pull request.

Please try to keep the code clean and follow the existing project structure.

---

# 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute the project according to the terms of the license.

---

# 🆘 Support

If you run into any issues:

* Open an issue in the GitHub repository
* Check the project documentation
* Review the available API endpoints
* Make sure all required environment variables are configured correctly

---

# 🙌 Acknowledgments

A big thanks to:

* OpenAI for AI-powered capabilities
* Google Vision for image recognition
* React and Node.js communities
* MongoDB and the open-source ecosystem
* All libraries and tools used to build this project

---

## ⭐ Final Note

JsGetFt is built to make fitness tracking smarter, simpler, and more engaging.

From workouts and nutrition to AI-powered food analysis, posture feedback, health tracking, challenges, and achievements — the goal is to provide a complete platform for managing your fitness journey.

If you like the project, consider giving the repository a ⭐!
