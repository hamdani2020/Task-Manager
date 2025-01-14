// index.js
import { AuthProvider } from "react-oidc-context";
import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from "@/App.tsx";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_qpSD45zzZ",
  client_id: "hfjkv26lfqqnjsi6lc7kj51ih",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "email openid phone",
};

const root = createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
