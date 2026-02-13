import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DefaultLayout } from "./layouts/DefaultLayout";
import { WelcomePage } from "./pages/WelcomePage";
import { HomePage } from "./pages/HomePage";
import { TripDisplayPage } from "./pages/TripDisplayPage";
import { NewTripPage } from "./pages/NewTripPage";
import { TripNotFoundPage } from "./pages/TripNotFoundPage";
import { AuthenticationPage } from "./pages/AuthenticationPage";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { PrivateOnlyRoute } from "./components/auth/PrivateOnlyRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { Navigate } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route element={<PrivateOnlyRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/:slug" element={<TripDisplayPage />} />
              <Route path="/plan" element={<NewTripPage />} />
              <Route path="/error" element={<TripNotFoundPage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
            <Route
              path="/authentication"
              element={
                <PublicOnlyRoute>
                  <AuthenticationPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/"
              element={
                <PublicOnlyRoute>
                  <WelcomePage />
                </PublicOnlyRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            maxWidth: "fit-content",
            width: "auto",
            whiteSpace: "nowrap",
          },
          duration: 2000,
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: "#FF5C5C",
              secondary: "white",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
