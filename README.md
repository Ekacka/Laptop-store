# Laptop Store

A full-stack laptop store application with user authentication, an admin dashboard, and order management.

## Setup Instructions

1. **Clone the repository**
   ```sh
   git clone <repository_url>
   cd laptopstore
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Start the server**
   ```sh
   node server.js
   ```

## Project Overview

This project is a laptop store with authentication, order management, and an admin panel.  
It uses:
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **Environment Configuration**: dotenv
- **API Documentation**: Express routes

## API Documentation

### Admin Routes
- `GET /` - Admin homepage
- `GET /check-auth` - Check admin authentication
- `POST /login` - Admin login
- `GET /logout` - Admin logout
- `GET /laptops` - Get all laptops
- `POST /add` - Add a new laptop
- `POST /update/:id` - Update laptop details
- `POST /delete/:id` - Delete a laptop
- `GET /best-selling` - Get best-selling laptops

### Order Routes
- `POST /orders` - Create a new order

### User Routes
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile


