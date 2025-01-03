import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface LoginPageProps {
  setAuthToken: (token: string) => void;
  authToken: string | null;
  handleLogout: () => void;
}

interface AuthResponse {
  auth_token: string;
}

interface AuthError {
  message: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ setAuthToken, authToken, handleLogout }) => {
  const navigate = useNavigate();
  const { authenticate, isLoggedIn } = useOkto();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        setError("No credential received from Google");
        return;
      }

      authenticate(idToken, (authResponse: AuthResponse | null, error: AuthError | null) => {
        if (authResponse?.auth_token) {
          setAuthToken(authResponse.auth_token);
          navigate("/home");
        }
        if (error) {
          setError("Authentication failed: " + error.message);
        }
      });
    } catch (err) {
      setError("Google login failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const onLogoutClick = () => {
    handleLogout();
    setError("");
    navigate('/');
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    maxWidth: "500px",
    margin: "0 auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  };

  const formSectionStyle: React.CSSProperties = {
    width: "100%",
    marginBottom: "20px",
  };

  const titleStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  };

  const buttonStyle: React.CSSProperties = {
    margin: "10px 0",
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    width: "100%",
    fontSize: "16px",
  };

  const errorStyle: React.CSSProperties = {
    color: "red",
    fontSize: "14px",
    marginTop: "10px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Login</h1>

      {/* Google Login */}
      <div style={formSectionStyle}>
        <h2>Google Authentication</h2>
        <p>Single-click authentication with Google.</p>
        {!authToken ? (
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Login Failed")}
            useOneTap={false}
          />
        ) : (
          <button style={buttonStyle} onClick={onLogoutClick}>
            Logout
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          ...errorStyle,
          padding: '10px',
          backgroundColor: '#fff3f3',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default LoginPage;
