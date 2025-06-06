# Full-stack note-taking application

A React-based web application for managing Markdown content notes.
This application allows users to create, update, delete, and organize notes.
It also provides features like text search and filtering to easily manage and retrieve
information.

---

## Overview

This project is a **full-stack note-taking application** built using the following stack:

- **Frontend**: React for the user interface, styled-components for styling, and various libraries for animations and UI
  improvements.
- **Backend**: Express.js as the server-side framework, Mongoose for data modeling with MongoDB, and Redis for caching.
- **Database**: MongoDB for storing notes data efficiently.
- **Utilities**: Axios for API requests, Yup and Formik for form management, JSON Web Token (JWT) for authentication,
  and more.

The app is focused on delivering a seamless user experience and robust API handling, including support for text-based
note search, filtering, and CRUD operations.

---

## Features

- **Note CRUD**: Create, Read, Update, and Delete notes.
- **Search**: Full-text search for notes.
- **Tagging**: Add tags to notes for better organization.
- **Pinning**: Pin important notes for quick access.
- **Pagination**: Helps users navigate through a large list of notes by breaking the list into multiple pages.

---

## Installation

1. Clone the repository:

```shell script
git clone https://github.com/YoussefKamal098/note_app.git
   cd note-app
```

2. Install dependencies:

```shell script
npm install
```

3. Set up the environment variables:
    - Create a new `.env` file in the root directory.
    - Add the following variables:

**Backend**

```env
# Application Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/notes
REDIS_URI=redis://127.0.0.1:6379
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=1

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000

# JWT Configuration
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=1d
REFRESH_TOKEN_COOKIES_NAME=refresh_token
REFRESH_TOKEN_COOKIE_MAX_AGE=86400  # 24 hours in seconds

# CSRF Configuration
CSRF_TOKEN_SECRET=CSRF_TOKEN_SECRET
CSRF_TOKEN_COOKIE_NAME=csrf-token
CSRF_TOKEN_COOKIE_MAX_AGE=86400  # 24 hours in seconds

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
STATE_TOKEN_SECRET=STATE_TOKEN_SECRET  # Secret for signing state tokens
STATE_TOKEN_EXPIRY=5m  # State token expiration (e.g., 5 minutes)
STATE_TOKEN_COOKIE_NAME=oauth_state  # Cookie name for storing state token
STATE_TOKEN_COOKIE_MAX_AGE=300  # 5 minutes in seconds (5 * 60)

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_FROM=your-email@example.com
EMAIL_TEMPLATES_DIR=./templates/emails

# Backblaze B2 Storage Configuration
B2_APPLICATION_KEY_ID=your-b2-application-key-id
B2_APPLICATION_KEY=your-b2-application-key
B2_BUCKET_ID=your-b2-bucket-id
B2_BUCKET_NAME=your-b2-bucket-name
B2_BUCKET_REGION=your-b2-bucket-region

# Storage Configuration
STORAGE_BASE_URL=https://storage.yourdomain.com
STORAGE_API_VERSION=v1

# Logging Configuration
LOGS_DIR=./logs
```

**Frontend**

```env
API_BASE_URL=http://localhost:5000/api/v1
NOTES_PER_PAGE=10
```

---

## Start the Application

### Development Mode

#### Express Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
   > This command typically uses a tool like [nodemon](https://www.npmjs.com/package/nodemon) for hot-reloading, so any
   changes in your backend code will automatically restart the server.  
   > Ensure your environment variables (e.g., port number) are set as needed.

#### React Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```
   > This command launches the React development server (typically on port 3000), which supports hot module replacement
   for instant feedback during development.

---

### Production Mode

#### Express Backend

1. **Build the project (if applicable):**  
   If you’re using Babel, TypeScript, or another transpiler, run the build script:
   ```bash
   npm run build
   ```
2. **Start the server in production mode:**
   ```bash
   npm start
   ```
   > Ensure you set the environment variable `NODE_ENV=production` before starting the server.  
   > For improved process management and automatic restarts, consider using [PM2](https://pm2.keymetrics.io/):
   ```bash
   pm2 start dist/app.js --name "my-express-app"
   ```

#### React Frontend

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
   > This command creates an optimized bundle in the `build` directory.
2. **Serve the static files:**
    - **Option A:** Use a static file server like [serve](https://www.npmjs.com/package/serve):
      ```bash
      npm install -g serve
      serve -s build
      ```
    - **Option B:** Integrate the frontend with your Express backend by adding middleware to serve static files. For
      example, add the following to your Express app:
      ```js
      const path = require('path');
      // Serve static files from the React app
      app.use(express.static(path.join(__dirname, 'frontend/build')));
 
      // The "catchall" handler: for any request that doesn't match one above, send back React's index.html.
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
      });
      ```
   > This approach allows both your backend API and the React frontend to run together on the same server.

---

## Usage

### 1. Start the backend server

- The backend server (Express.js) listens for API requests and connects to MongoDB and Redis. It must be started before
  accessing the frontend.

### 2. Access the frontend

- While the backend is running, you can interact with the app through the web at `http://localhost:3000`.

## API Endpoints

### Routes

### File Management API

The following routes are used for file operations:

| HTTP Method | Endpoint               | Description                         |
|-------------|------------------------|-------------------------------------|
| `GET`       | `api/v1/files/:fileId` | Retrieve a specific file by its ID. |

#### Notes API

The following routes are used for managing notes:

| HTTP Method | Endpoint                             | Description                                                                                                                    |
|-------------|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `POST`      | `api/v1/users/:userId/notes`         | Create a new note for the specified user. You can use `"me"` as the userId to refer to the authenticated user.                 |
| `GET`       | `api/v1/users/:userId/notes`         | Retrieve paginated notes for the specified user with optional query parameters. Use `"me"` to refer to the authenticated user. |
| `GET`       | `api/v1/users/:userId/notes/:noteId` | Retrieve a specific note by its ID for the specified user. You can replace `:userId` with `"me"` for the authenticated user.   |
| `PUT`       | `api/v1/users/:userId/notes/:noteId` | Update a specific note by its ID for the specified user. Replace `:userId` with `"me"` to target the authenticated user.       |
| `DELETE`    | `api/v1/users/:userId/notes/:noteId` | Delete a specific note by its ID for the specified user. Use `"me"` in place of `:userId` for the authenticated user.          |

#### User and Authentication API

The following routes are used for user management and authentication:

| HTTP Method | Endpoint                      | Description                                                                                                                                                                      |
|-------------|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `POST`      | `api/v1/auth/register`        | Register a new user and send an OTP code to the provided email for verification                                                                                                  |
| `POST`      | `api/v1/auth/login`           | Log in an existing user                                                                                                                                                          |
| `POST`      | `api/v1/auth/logout`          | Log out the currently logged-in user                                                                                                                                             |
| `POST`      | `api/v1/auth/refresh`         | Refresh the access token using the stored JWT in the cookie in browser                                                                                                           |
| `POST`      | `api/v1/auth/verify_email`    | Verify the user's email address using the provided OTP code                                                                                                                      |
| `POST`      | `api/v1/auth/google`          | Initiates the Google OAuth 2.0 authentication process (redirects to Google's consent screen)                                                                                     |
| `POST`      | `api/v1/auth/google/callback` | Handles the OAuth 2.0 callback from Google, exchanges authorization code for user data, and authenticates the user                                                               |
| `GET`       | `api/v1/csrf-tokens`          | This endpoint generates a new CSRF token and returns it in the response.<br/>The token is used to protect subsequent requests against cross-site request forgery (CSRF) attacks. |
| `GET`       | `api/v1/users/:userId`        | Retrieve the user's profile. You can either provide a specific userId or use the keyword "me", which will automatically resolve to the authenticated user's ID.                  |
| `POST`      | `api/v1/users/:userId/avatar` | Upload a new profile avatar for the user. Only image/png, image/jpeg, and image/webp formats are allowed. Replace `:userId` with `"me"` to target the authenticated user         |   

---

## Folder and File Structure

### Project Structure

```
notes_app/
├── .idea/                         # IDE configuration files (e.g., for JetBrains tools)
├── backend/                       # Backend application code (Node.js, Express)
│   ├── config/                    # Configuration files for the backend
│   ├── constants/                 # Centralized application constants and configurations
│   ├── controllers/               # Controller files for handling HTTP requests
│   ├── errors/                    # Error handling classes and functions
│   ├── interfaces/                # Contains interface definitions to standardize data structures
│   ├── middlewares/               # Middleware for various backend operations
│   ├── models/                    # Database models using ORM/ODM (e.g., Mongoose schemas)
│   ├── queues/                    # Background job queues and workers and task scheduling (e.g., using Bull)
│   ├── repositories/              # Data access layer for database queries and operations
│   ├── routes/                    # API routes for defining endpoints and HTTP methods
│   ├── services/                  # Service layer for business logic and external integrations
│   │   ├── storage/                # Implements IStorageEngine interface with wrappers for storage SDKs (Backblaze B2, AWS S3, Google Cloud, etc.)
│   ├── templates/                 # This folder contains Handlebars (.hbs) email template files used for generating dynamic email content.
│   ├── types/                     # Global type definitions (JSDoc typedefs) for application models, configs, and utilities
│   ├── utils/                     # Utility functions for various tasks
│   ├── validations/               # Validation logic for incoming requests (data validation)
│   ├── .nvmrc                     # Node.js version specification .nvmrc  
│   ├── serverInitializer.js       # Responsible for initializing the server by setting up middleware, routing, and other core configurations for the application.
│   ├── app.js                     # Main application setup (e.g., middleware, routing)
│   ├── package.json               # Node.js package manager file for backend dependencies
├── frontend/                      # Frontend React app code
│   ├── public/                    # Static files for the frontend (e.g., images, icons)
│   ├── src/                       # Source code for the React application
│   │   ├── api/                   # API communication layer (making HTTP requests to backend)
│   │   │   ├── interceptors/      # interceptors for global request/response handling
│   │   ├── components/            # Reusable React components for UI
│   │   │   ├── animations/        # Components for handling animations
│   │   │   ├── buttons/           # Button components (e.g., delete, pin)
│   │   │   ├── common/            # Common reusable components (e.g., loader, pagination)
│   │   │   ├── confirmationPopup/ # Component for handling confirmation popups (e.g., for delete actions)
│   │   │   ├── dynamicTabs/       # Component for rendering dynamic tabs (e.g., for navigation or content categorization)
│   │   │   ├── editPopUp/         # Component for rendering dynamic editor popUp (e.g., for tags and title)
│   │   │   ├── errors/            # Contains components for handling and displaying errors.
│   │   │   ├── forms/             # Form components (login, registration, input fields)
│   │   │   ├── menus/             # Menu components (e.g. UserMenu, NoteMenu, etc.)
│   │   │   ├── navbar/            # Navigation bar components
│   │   │   ├── note/              # Components related to note display and creation
│   │   │   ├── noteCards/         # Components for displaying notes
│   │   │   ├── noteMarkdownTabs/  # Components for displaying note markdown editor
│   │   │   ├── notifications/     # Components for displaying notifications
│   │   │   ├── otp/               # This folder contains React components related to OTP (One-Time Password) verification.
│   │   │   ├── pagination/        # Pagination component module.
│   │   │   ├── profileImageUploader/           # This folder contains React components for profile image uploading and editing.
│   │   │   ├── progressiveImage/               # This folder contains React components for progressive image loading (from placeholder to high-res images).
│   │   │   ├── searchBar/         # Search bar component for filtering/searching notes
│   │   │   ├── tags/              # Components for managing tags on notes
│   │   │   ├── title/              # Components for managing title on notes
│   │   │   ├── tooltip/           # Directory containing Tooltip component for displaying hoverable tooltips.
│   │   ├── config/                # The 'config' directory contains configuration files that manage various frontend settings, such as environment variables
│   │   ├── constants/             # Contains constants used throughout the application, such as HTTP codes and status messages.
│   │   ├── contexts/              # React contexts for managing global state
│   │   ├── hooks/                 # Custom React hooks for managing reusable logic across components
│   │   ├── pages/                 # Pages for the different app routes (Home, Login, Register, Note, Errors, etc.)
│   │   ├── services/              # Contains utility services for managing various frontend functionalities
│   │   ├── styles/                # Styles (CSS) for the app's UI
│   │   ├── validations/           # Frontend form validation logic (email, password, etc.)
│   │   ├── workers/               # Web Workers for running background tasks without blocking the main thread
│   │   ├── App.jsx                # Main React component for the app (entry point)
│   │   ├── index.css              # Main CSS for styling the frontend app
│   │   ├── index.js               # React app entry point (rendering the app)
│   │   ├── reportWebVitals.js     # For measuring performance in the app
│   ├── .nvmrc                     # Node.js version specification .nvmrc
│   ├── package.json               # Node.js package manager file for frontend dependencies
├── shared-utils/                  # Contains shared utility functions and modules used across both frontend and backend applications. This folder includes reusable logic, helper functions, and other tools designed to be used consistently throughout the project for code modularity and maintainability.
├── .gitignore                     # Git ignore file (e.g., node_modules, .env, build files)
├── LICENSE                        # License file for the project
├── README.md                      # Project documentation (overview of the app, setup instructions)

```

---

## Potential Improvements

### 1. **Unit Tests**

- Implement unit tests for both backend routes (API endpoints) and frontend components. This will ensure that
  codebase remains stable and is less prone to regressions.

### 2. **Offline Access**

- Implement **service workers** and **IndexedDB** for **offline access**. This will allow users to access their notes
  even without an internet connection. The app could sync changes to the backend once the internet is available.

### 3. **Email and Password Change**

- Allow users to **update their email** and **password** securely. Adding `multi-factor` authentication (MFA) can also
  improve security during these changes.

### 4. **Delete Account**

- Provide users with the option to **delete their account**. Ensure that the data is wiped securely from both the
  backend and frontend storage.

### 5. **Compression for Large Markdown Content (Frontend & Backend)**

- Implement **compression for large Markdown content** (using libraries like `pako` in the frontend and `zlib` in the
  backend) to reduce the amount of data transmitted over the network.

### 6. **Archive and Collection Notes**

- Enable users to **archive or group their notes** into different **collections**. This will help with better
  organization and easier access to notes.

### 7. **User Settings Section**

- Create a **user settings page** where users can:
    - Update their email and password.
    - View and manage active sessions.
    - Customize preferences like theme, language, etc.

### 8. **Version History / Note History**

- Implement a **note history/version control** feature to track changes over time. Users can view past versions of a
  note and restore them if needed. This feature can be especially useful for collaborative environments.

### 9. **Data Encryption (Security)**

- Encrypt sensitive data (e.g., user data, note content) both at rest and in transit.
  This will help improve the app's security and protect user privacy.

### 10. **Notification System**

- Implement an in-app **notification system** to alert users about important updates, reminders, or new activities on
  their notes or account.

---

## Contribution Guidelines

1. Fork the project.
2. Create a separate feature branch: `git checkout -b feature-name`.
3. Commit changes and push to GitHub.
4. Open a pull request for review.

---

## License

This project is open-source and available under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
