// load environment variables from .env file
require('dotenv').config({path: './.env.example', override: true, debug: true});

// check the value of USER and modify it if necessary
if (process.env.USER === 'codespace') {
  process.env.REACT_APP_BACKEND_URL = `https://${CODESPACE_NAME}-4567.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
} else if (process.env.USER === 'gitpod') {
  process.env.REACT_APP_BACKEND_URL = `https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}`;
}

console.log(process.env.REACT_APP_BACKEND_URL)

// start the React app
require('react-scripts/scripts/start');
