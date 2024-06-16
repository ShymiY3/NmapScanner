import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/ChangePassword";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import ScanResults from "./pages/ScanResults";
import ScanDetail from "./pages/ScanDetail";
import UserManagement from "./pages/UserManagement";
import UserUpdate from "./pages/UserUpdate";
import UserCreate from "./pages/UserCreate";
import AllScanResults from "./pages/AllScanResults";
import UserProfile from "./pages/UserProfile";
import FlagsManagement from "./pages/FlagsManagement";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/scan-results"
          element={
            <PrivateRoute>
              <Layout>
                <ScanResults />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/scan/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ScanDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <PrivateRoute adminOnly={true}>
              <Layout>
                <UserManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <PrivateRoute adminOnly={true}>
              <Layout>
                <UserUpdate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/user-create"
          element={
            <PrivateRoute adminOnly={true}>
              <Layout>
                <UserCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/all-scans"
          element={
            <PrivateRoute adminOnly={true}>
              <Layout>
                <AllScanResults />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <PrivateRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/flags-management"
          element={
            <PrivateRoute adminOnly={true}>
              <Layout>
                <FlagsManagement />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
