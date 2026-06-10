import { lazy, Suspense } from "react";
import { Outlet, Route, HashRouter as Router, Routes } from "react-router-dom";

import styles from "./App.module.css";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
const Home = lazy(() => import("./pages/Home/Home"));
const Login = lazy(() => import("./pages/Login/Login"));
const Match = lazy(() => import("./pages/Match/Match"));
const MatchSettings = lazy(() => import("./pages/MatchSettings/MatchSettings"));
const Practice = lazy(() => import("./pages/Practice/Practice"));
const PracticeSettings = lazy(() => import("./pages/PracticeSettings/PracticeSettings"));
const Statistics = lazy(() => import("./pages/Statistics/Statistics"));
const MatchesPage = lazy(() => import("./pages/MatchesPage/MatchesPage"));

const App = () => {
  return (
    <div className={styles.app}>
      <Router>
        <Suspense>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/match" element={<Match />} />
              <Route path="/match-settings" element={<MatchSettings />} />
              <Route path="/practice-settings" element={<PracticeSettings />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/statistics/matches" element={<MatchesPage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
};

export default App;
