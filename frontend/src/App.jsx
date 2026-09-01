import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import ReportPage from "./pages/ReportPage";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import VoiceTest from "./pages/VoiceTest";
import VerifyEmail from "./pages/VerifyEmail";
import React from "react";
import Settings from "./pages/Settings";
import CursorDot from "./components/common/CursorDot";
import OAuthSuccess from "./pages/OAuthSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SystemCheck from "./pages/SystemCheck";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
function App() {
  return (
    <>
      <Navbar />
      <CursorDot />
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/interview/:interviewId" element={<PrivateRoute><InterviewRoom /></PrivateRoute>} />
        <Route path="/report/:interviewId" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
        <Route path="/voice-test" element={<VoiceTest />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
        <Route path="/interview/:interviewId/check" element={<PrivateRoute><SystemCheck /></PrivateRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route
    path="/resume"
    element={
        <PrivateRoute>
            <Resume />
        </PrivateRoute>
    }
/>
      </Routes>
      
    </>
  );
}

export default App;