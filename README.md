# 📝 Full-Stack Note-Taking App

A modern, mobile-first note-taking web application built with React, Tailwind CSS, Node.js, and MySQL. Features comprehensive user authentication, rich-text editing, and a polished user interface.

## ✨ Features

### Authentication & Security
- **Email/Password Registration** with secure bcrypt hashing
- **Google OAuth** integration for quick sign-up/sign-in
- **Email OTP Verification** for enhanced security
- **JWT-based Authorization** for API protection
- Input validation on both frontend and backend

### Note Management
- **Rich-text Editor** with formatting toolbar (bold, italic, underline, font colors)
- **CRUD Operations** - Create, Read, Update, Delete notes
- **Note Actions** - Pin, archive, and organize your notes
- **Auto-save Timestamps** and character count display
- **Pagination** for efficient note browsing

### User Experience
- **Mobile-first Responsive Design** optimized for all devices
- **Clean Dashboard** with user details and note overview
- **Toast Notifications** for user feedback and error handling
- **Inter Font** for modern, readable typography

## 🛠️ Tech Stack

### Frontend
- **React** (JSX) - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Inter Font** - Modern typography

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - Object-Relational Mapping (ORM)
- **MySQL** - Relational database
- **bcrypt** - Password hashing
- **JWT** - JSON Web Tokens for authentication
- **Nodemailer** - Email service for OTP delivery


## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Annibadakh/notes_taking_frontend
   cd note-taking-app
   ```

   **Backend Repository:** https://github.com/Annibadakh/notes_taking_backend

2. **Set up the backend**
   ```bash
   cd notes_taking_backend
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../notes_taking_frontend
   npm install
   ```

4. **Configure environment variables**
   
   Create `.env` file in the `server` directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=notes_app
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Email (for OTP via Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   
   # Server
   PORT=5000
   ```

5. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE notes_app;
   exit;
   
   ```

6. **Start the development servers**
   
   Backend (from `notes_taking_backend` directory):
   ```bash
   npm run dev
   ```
   
   Frontend (from `notes_taking_frontend` directory):
   ```bash
   npm start
   ```

The application will be available at `http://localhost:5173`

## 🌐 Live Demo

- **Frontend:** https://app-note-taking.netlify.app
- **Backend API:** https://server.moonstoneedu.in/notetaking


## 🎨 UI Components

- **Authentication Forms** - Login, register, OTP verification
- **Dashboard** - User overview and notes grid
- **Note Editor** - Rich-text editing interface
- **Note Card** - Individual note display
- **Toast Notifications** - Success/error messages
- **Loading States** - Skeleton loaders and spinners

## 🔒 Security Features

- **Password Hashing** using bcrypt
- **JWT Token Authentication**
- **Input Validation**
- **Protected Routes** with middleware


## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Deploy to your preferred platform (Heroku, DigitalOcean, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact us at badakhaniket@gmail.com.

---

**Happy Note-Taking! 📝**