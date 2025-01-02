import React from 'react';
import ReactDOM from 'react-dom/client'; // Correctly importing ReactDOM
import { AuthProvider } from 'react-oidc-context';
import App from './App'; // Ensure you import your App component

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_qpSD45zzZ",
  client_id: "hfjkv26lfqqnjsi6lc7kj51ih",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "phone openid email",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
