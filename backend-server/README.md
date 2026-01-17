# Backend Server

This project is a backend server built with Node.js and Express, designed to interact with a MongoDB database cluster. 

## Project Structure

```
backend-server
├── src
│   ├── controllers        # Contains controller functions for handling requests
│   ├── models             # Contains Mongoose models for MongoDB collections
│   ├── routes             # Contains route definitions for the API
│   ├── config             # Contains configuration files, including database connection
│   └── app.js             # Entry point of the application
├── package.json           # NPM configuration file
├── .env                   # Environment variables
└── README.md              # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd backend-server
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration

The backend loads environment variables from the repo root `.env` (see `dotenv.config({ path: '../.env' })` in `src/app.js`).

From the repository root:
```
cp .env.example .env
```

Then set the server variables (no `VITE_` prefix), e.g. `MONGODB_URI`, `TWILIO_*`, `PORT`, `FRONTEND_URL`.

Do not commit `.env` to git. Use a secret store in production.

## Usage

To start the server, run:
```
npm start
```

The server will be running on `http://localhost:3000` by default.

## API Endpoints

Documentation for the API endpoints will be added here as the project develops. 

## License

This project is licensed under the MIT License.