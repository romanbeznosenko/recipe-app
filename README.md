# Recipe App

A full-stack application for creating and sharing recipes with a FastAPI backend and React frontend.

## Project Structure 
```
recipe-app/
├── backend/
│   ├── db/
│   │   ├── base.py                 # Database connection and Base definition
│   │   ├── database.py             # Database operations and reset functions
│   │   ├── entries/                # Model definitions
│   │   └── utils/
│   │       └── mixins.py           # TimestampMixin for created_at/updated_at
│   ├── routers/
│   │   ├── user_router.py          # User and signup endpoints
│   │   └── auth_router.py          # Authentication endpoints
│   ├── main.py                     # FastAPI application
│   ├── setup_models.py             # Model initialization to avoid circular imports
│   ├── database.py                 # Database initialization and seeding
│   ├── requirements.txt            # Backend dependencies
│   ├── start.sh                    # Startup script for Docker
│   ├── Dockerfile                  # Docker configuration for backend
│   └── .env                        # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js                  # Main React app with routing
│   ├── package.json                # Frontend dependencies
│   ├── Dockerfile                  # Docker configuration for frontend
│   ├── nginx.conf                  # Nginx configuration for production
│   └── public/                     # Public assets
├── docker-compose.yml              # Docker Compose configuration
```

## Running with Docker (Recommended)

The easiest way to run the application is using Docker Compose, which will set up the database, backend, and frontend in one command.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

1. Clone the repository
```bash
git clone https://github.com/romanbeznosenko/recipe-app
cd recipe-app
```

2. Make sure your backend/.env file has the correct settings:
```
MYSQL_ROOT_PASSWORD="root_password"
MYSQL_DATABASE="recipe_app"
MYSQL_USER="username"
MYSQL_PASSWORD="password"
MYSQL_HOST="mysql"  # Important: use "mysql" not "localhost" for Docker
MYSQL_PORT=3306
JWT_SECRET_KEY="your_secret_key"
CORS_ORIGINS=http://localhost,http://localhost:3000,http://localhost:80,http://frontend:3000
```

3. Build and start all services
```bash
docker-compose up -d --build
```

4. Access the application
   - Frontend: [http://localhost](http://localhost) or [http://localhost:3000](http://localhost:3000) for development
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - Backend API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Backend API Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

5. To stop the application
```bash
docker-compose down
```

## Service Access Information

| Service           | URL                                           | Description                              |
|-------------------|-----------------------------------------------|------------------------------------------|
| Frontend          | [http://localhost](http://localhost)          | Production frontend (served by Nginx)    |
| Frontend (Dev)    | [http://localhost:3000](http://localhost:3000)| Development frontend (with hot reload)   |
| Backend API       | [http://localhost:8000](http://localhost:8000)| FastAPI backend service                  |
| API Documentation | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI API documentation  |
| API Redoc         | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc API documentation     |
| Database          | localhost:3306                                | MySQL database (access via client tools) |

## Running Locally (Development)

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/romanbeznosenko/recipe-app
cd recipe-app/backend
```

2. Create and activate a virtual environment (optional but recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Make sure MySQL is running and update the .env file with local settings

5. Initialize the database
```bash
python -m db.database
```

6. Run the API server
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory
```bash
cd recipe-app/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```
This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

This builds the app for production to the `build` folder.

## Available Scripts (Frontend)

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from create-react-app

## Sample User Credentials

For testing purposes, the database is seeded with the following user accounts:

| Username  | Email              | Password      |
|-----------|-------------------|---------------|
| admin     | admin@example.com | Admin123!     |
| chef_john | chef@example.com  | ChefJohn123!  |
| home_cook | cook@example.com  | HomeCook123!  |

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)