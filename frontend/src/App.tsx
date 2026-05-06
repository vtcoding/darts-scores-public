import { Outlet, Route, HashRouter as Router, Routes } from "react-router-dom";

import styles from "./App.module.css";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Match from "./pages/Match/Match";
import MatchSettings from "./pages/MatchSettings/MatchSettings";
import Practice from "./pages/Practice/Practice";
import PracticeSettings from "./pages/PracticeSettings/PracticeSettings";
import Statistics from "./pages/Statistics/Statistics";
import MatchesPage from "./pages/MatchesPage/MatchesPage";

const App = () => {
  return (
    <div className={styles.app}>
      <Router>
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
      </Router>
    </div>
  );
};

export default App;
