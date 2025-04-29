# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


# Project Structure 
```
recipe-app/
│
├── backend/                  # FastAPI backend
│   ├── app/                  # Main application folder
│   │   ├── __init__.py       # Makes app a package
│   │   ├── main.py           # Main FastAPI app
│   │   ├── database.py       # Database connection and session
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # Authentication utilities
│   │   └── routers/          # API routes separated by resource
│   │       ├── __init__.py
│   │       ├── users.py      # User routes
│   │       ├── recipes.py    # Recipe routes
│   │       ├── ingredients.py # Ingredient routes
│   │       └── auth.py       # Auth routes
│   ├── alembic/              # Database migrations (optional)
│   │   ├── versions/
│   │   └── alembic.ini
│   ├── sql/                  # SQL scripts
│   │   └── init.sql          # Initial database setup
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables example
│   ├── .env                  # Environment variables (gitignored)
│   └── Dockerfile            # For containerization (optional)
│
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── ...
│   ├── src/                  # Source code
│   │   ├── assets/           # Images, fonts, etc.
│   │   ├── components/       # Reusable React components
│   │   │   ├── TopNav/
│   │   │   │   ├── TopNav.js
│   │   │   │   └── TopNav.css
│   │   │   ├── Step/
│   │   │   │   ├── Step.js
│   │   │   │   └── Step.css
│   │   │   ├── Recipe/
│   │   │   │   ├── Recipe.js
│   │   │   │   └── Recipe.css
│   │   │   └── RecipeCard/
│   │   │       ├── RecipeCard.js
│   │   │       └── RecipeCard.css
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage/
│   │   │   │   ├── HomePage.js
│   │   │   │   └── HomePage.css
│   │   │   ├── RecipePage/
│   │   │   │   ├── RecipePage.js
│   │   │   │   └── RecipePage.css
│   │   │   ├── LoginPage/
│   │   │   │   ├── LoginPage.js
│   │   │   │   └── LoginPage.css
│   │   │   └── SignUpPage/
│   │   │       ├── SignUpPage.js
│   │   │       └── SignUpPage.css
│   │   ├── services/         # API services
│   │   │   ├── api.js        # API client setup (axios)
│   │   │   ├── auth.js       # Authentication service
│   │   │   └── recipe.js     # Recipe service
│   │   ├── context/          # React context providers
│   │   │   └── AuthContext.js # Auth context
│   │   ├── utils/            # Utility functions
│   │   │   └── helpers.js
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useAuth.js    # Auth hook
│   │   ├── App.js            # Main App component
│   │   ├── index.js          # Entry point
│   │   └── App.css           # Global styles
│   ├── package.json          # npm dependencies
│   ├── README.md             # Frontend documentation
│   └── Dockerfile            # For containerization (optional)
│
├── docker-compose.yml        # Docker compose setup (optional)
├── .gitignore                # Git ignore file
└── README.md                 # Project documentation
```