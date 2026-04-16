import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import ClassPlanView from './pages/Dashboard/ClassPlanView';
import PaymentPage from './pages/Dashboard/PaymentPage';
import FeatureView from './pages/Dashboard/FeatureView';
// import ClassDetails from './pages/Class/ClassDetails';

const PrivateRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, roleRequired }) => {
  const { user } = React.useContext(AuthContext);
  return user?.role === roleRequired ? children : <Navigate to="/" />;
};

const DashboardRouter = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'teacher') {
    return <Navigate to="/teacher" />;
  } else {
    return <Navigate to="/student" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardRouter />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/teacher/*" element={
            <PrivateRoute>
              <RoleRoute roleRequired="teacher">
                <TeacherDashboard />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* Feature page route */}
          <Route path="/student/feature/:type" element={
            <PrivateRoute>
              <RoleRoute roleRequired="student">
                <FeatureView />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* Payment page route */}
          <Route path="/student/class/:classId/pay/:planId" element={
            <PrivateRoute>
              <RoleRoute roleRequired="student">
                <PaymentPage />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* More specific student route MUST come before /student/* wildcard */}
          <Route path="/student/class/:id" element={
            <PrivateRoute>
              <RoleRoute roleRequired="student">
                <ClassPlanView />
              </RoleRoute>
            </PrivateRoute>
          } />

          <Route path="/student/*" element={
            <PrivateRoute>
              <RoleRoute roleRequired="student">
                <StudentDashboard />
              </RoleRoute>
            </PrivateRoute>
          } />

          {/* <Route path="/class/:id" element={<PrivateRoute><ClassDetails /></PrivateRoute>} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
