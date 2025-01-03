import LoginPage from "./LoginPage";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginPage setAuthToken={() => {}} authToken={null} handleLogout={() => {}} /> 
    </div>
  )
} 