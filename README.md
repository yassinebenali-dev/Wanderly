# Wanderly – AI-Powered Travel Planning Platform

🚀 A full-stack web platform designed to help users discover destinations, plan personalized trips, and organize their travel experience using AI-powered recommendations.

## 📘 Overview

**Wanderly** was developed as part of our **Projet de Fin d'Études (PFE)** at **DEFENDR**, during the final year of the **Licence en Informatique** program at **FST El Manar**.

The platform combines modern web technologies with **Artificial Intelligence** to provide users with a personalized and interactive travel planning experience. Users can explore destinations, generate personalized itineraries, manage their travel budget, and organize their trips from a single platform.

## 🎯 Objectives

* Help users discover travel destinations based on their preferences
* Generate personalized travel itineraries using AI
* Simplify the organization and planning of trips
* Help users estimate and manage their travel budget
* Provide a centralized platform for managing travel plans
* Offer an intuitive and modern user experience

## ⚙️ Technologies Used

### Frontend:

* React.js
* JavaScript
* HTML5
* CSS3

### Backend:

* Node.js
* Express.js

### Database:

* MySQL

### AI & APIs:

* Groq AI
* SerpAPI

### Tools:

* Git & GitHub
* Postman
* VS Code

## 🧠 Features

* 🔐 User authentication and account management
* 🌍 Destination discovery and exploration
* 🤖 AI-powered travel recommendations
* 🗺️ Personalized itinerary generation
* 💾 Saved destinations and travel plans
* 💰 Travel budget planning and management
* 📋 Trip checklists
* 📅 Trip organization and planning
* 💳 Subscription management
* 📊 Admin dashboard with platform statistics
* 📱 Responsive and user-friendly interface

## 📦 Installation & Usage

> 🗂 The source code is available in this repository.

### Prerequisites

* Node.js & npm
* MySQL Server
* Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Wanderly.git
cd Wanderly
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the required environment variables:

```env
PORT=5000

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=wanderly_db

GROQ_API_KEY=your_groq_api_key
SERPAPI_KEY=your_serpapi_key
```

Then start the backend server:

```bash
npm start
```

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

### Step 4: MySQL Database Setup

* Create a new MySQL database named `wanderly_db`
* Import the provided SQL schema/database file
* Make sure the database credentials match your `.env` configuration

### Step 5: Launch the Application

Once both the frontend and backend are running, open the application in your browser:

```text
http://localhost:3000
```

## 📸 Screenshots

<p align="center">
<img src="Screenshots/screenshot1.png" alt="Wanderly Homepage" height="600" width="49%" />
<img src="Screenshots/screenshot2.png" alt="Destination Exploration" height="600" width="49%" />
</p>

<p align="center">
<img src="Screenshots/screenshot3.png" alt="AI Travel Planning" height="600" width="49%" />
<img src="Screenshots/screenshot4.png" alt="Travel Itinerary" height="600" width="49%" />
</p>

<p align="center">
<img src="Screenshots/screenshot5.png" alt="Trip Dashboard" height="600" width="49%" />
<img src="Screenshots/screenshot6.png" alt="Budget Management" height="600" width="49%" />
</p>

<p align="center">
<img src="Screenshots/screenshot7.png" alt="Admin Dashboard" height="600" width="49%" />
<img src="Screenshots/screenshot8.png" alt="User Profile" height="600" width="49%" />
</p>

👉 More screenshots are available in the **`Screenshots`** folder.

## 📚 Learning Outcomes

Through this project, we developed strong skills in:

* Full-stack web development
* RESTful API development
* Database design and SQL
* Artificial Intelligence integration
* API integration and data retrieval
* AI-powered recommendation systems
* UI/UX design
* Authentication and user management
* Git and GitHub version control
* Teamwork and project management

## 🚧 Future Improvements

* ✈️ Integration with flight and hotel booking services
* 🧠 More advanced AI-based travel personalization
* 🗺️ Interactive maps and route optimization
* 🌐 Multi-language support
* 💱 Multi-currency support
* 📱 Dedicated mobile application
* 🔔 Real-time notifications
* 👥 Social features for sharing trips and itineraries

## 📄 License

This project was developed for academic purposes as part of a **Projet de Fin d'Études (PFE)**.

All rights reserved © 2025.
