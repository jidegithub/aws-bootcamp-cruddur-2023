import './App.css';

import HomeFeedPage from './pages/HomeFeedPage';
import NotificationsFeedPage from './pages/NotificationsFeedPage';
import UserFeedPage from './pages/UserFeedPage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import RecoverPage from './pages/RecoverPage';
import MessageGroupsPage from './pages/MessageGroupsPage';
import MessageGroupPage from './pages/MessageGroupPage';
import MessageGroupNewPage from './pages/MessageGroupNewPage';
import ConfirmationPage from './pages/ConfirmationPage';
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
// import { Amplify, Auth } from 'aws-amplify';

// Amplify.configure({
//   Auth: {
//     // REQUIRED - Amazon Cognito Region
//     region: process.env.REACT_APP_AWS_PROJECT_REGION,

//     // OPTIONAL - Amazon Cognito User Pool ID
//     userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,

//     // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
//     userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
//   },
// });

// // You can get the current config object
// const currentConfig = Auth.configure();

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeFeedPage />
  },
  {
    path: "/notifications",
    element: <NotificationsFeedPage />
  },
  {
    path: "/@:handle",
    element: <UserFeedPage />
  },
  {
    path: "/messages",
    element: <MessageGroupsPage />
  },
  {
    path: "/messages/new/:handle",
    element: <MessageGroupNewPage />
  },
  {
    path: "/messages/:message_group_uuid",
    element: <MessageGroupPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/signin",
    element: <SigninPage />
  },
  {
    path: "/confirm",
    element: <ConfirmationPage />
  },
  {
    path: "/forgot",
    element: <RecoverPage />
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;