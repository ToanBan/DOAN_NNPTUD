import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/Home";
import Profile from "./pages/Profile";
import Forgot from "./pages/Forgot";
import ResetPassword from "./pages/ResetPassword";
import VerifyOTP from "./pages/VerifyOTP";
import Search from "./pages/Search";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/profile/:id" element={<Profile/>}/>
        <Route path="/search" element={<Search/>}/>
        <Route path="/forgot-password" element={<Forgot/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/verify-otp" element={<VerifyOTP/>}/>
      </Routes>
    </Router>
  );
}

export default App
