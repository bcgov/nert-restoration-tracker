// import CircularProgress from "@mui/material/CircularProgress";
// import { ThemeProvider } from "@mui/material/styles";
// import { ReactKeycloakProvider } from "@react-keycloak/web";
// import { AuthStateContextProvider } from "./contexts/authStateContext";
// import { ConfigContext, ConfigContextProvider } from "./contexts/configContext";
// import Keycloak from "keycloak-js";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import appTheme from "./themes/appTheme";
import SearchPage from "./features/search/SearchPage2";
import PublicProjectsListPage from "./pages/public/PublicProjectsPlansListPage";
import PublicLayout from "./layouts/PublicLayout";
import ProjectsLayout from "./features/projects/ProjectsLayout";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          {/* Default page is the map search page */}
          <Route index element={<SearchPage />} />
          <Route path="/" element={<SearchPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* TODO: This require authentication to show any data */}
          <Route element={<ProjectsLayout />}>
            <Route path="/projects" element={<PublicProjectsListPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
