import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import FeedPage from "../pages/FeedPage";
import MessagesPage from "../pages/MessagesPage";
import CommunitiesPage from "../pages/ComunitiesPage";
import CommunityPage from "../pages/CommunityPage";
import NotificationsPage from "../pages/NotificationsPage";
import ProfilePage from "../pages/ProfilePage";
import OtherUserProfilePage from "../pages/OtherUserProfilePage";
import FollowersPage from "../pages/FollowersPage";
import FollowingPage from "../pages/FollowingPage";
import ProtectedRoute from "./ProtectedRoute";
import CreateGroupPage from "../pages/CreateGroupPage";
import SearchPage from "../pages/SearchPage";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <OtherUserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/followers"
          element={
            <ProtectedRoute>
              <FollowersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/followers/:userId"
          element={
            <ProtectedRoute>
              <FollowersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/following"
          element={
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/following/:userId"
          element={
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/ai" element={<Navigate to="/" replace />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/communities"
          element={
            <ProtectedRoute>
              <CommunitiesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/create"
          element={
            <ProtectedRoute>
              <CreateGroupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/communities/:communityId"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
