import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify, Auth } from 'aws-amplify';

Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: process.env.REACT_APP_AWS_PROJECT_REGION,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
  },
});

// You can get the current config object
const currentConfig = Auth.configure();

const el_main = document.getElementsByTagName('main')[0];
const root = ReactDOM.createRoot(el_main);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
