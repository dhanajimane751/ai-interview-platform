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

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/interview/:interviewId" element={<PrivateRoute><InterviewRoom /></PrivateRoute>} />
        <Route path="/report/:interviewId" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
        <Route path="/voice-test" element={<VoiceTest />} />
      </Routes>
      
    </>
  );
}

export default App;