import CircularProgress from "@mui/material/CircularProgress";
import { ThemeProvider } from "@mui/material/styles";
import { ReactKeycloakProvider } from "@react-keycloak/web";
// import AppRouter from "./AppRouter";
import PublicLayout from "./layouts/PublicLayout";
import { AuthStateContextProvider } from "./contexts/authStateContext";
import { ConfigContext, ConfigContextProvider } from "./contexts/configContext";
import Keycloak from "keycloak-js";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import appTheme from "./themes/appTheme";
import SearchPage from "./features/search/SearchPage";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <ConfigContextProvider>
        <ConfigContext.Consumer>
          {(config) => {
            if (!config) {
              return <CircularProgress className="pageProgress" size={40} />;
            }

            // const keycloak = new Keycloak(config.KEYCLOAK_CONFIG);

            return (
              <BrowserRouter>
                <Routes>
                  {/* <Route path="/" element={<PublicLayout />}> */}
                  <Route index element={<SearchPage />} />
                  <Route path="/search" element={<div>search page</div>} />
                  {/* TODO: This is where all the public routes go. */}
                  {/* <Route path="/" element={<Navigate to="/" />} /> */}
                  {/* <Route path="/admin/search" /> */}
                  {/* <Route path="/search" /> */}
                  {/* <Route path="/admin/search" /> */}
                  {/* <Route path="/projects" element={<PublicProjectsRouter />} /> */}
                  {/* <Route path="/search" element={<SearchPage />} /> */}
                  {/* <Route path="/page-not-found" element={<NotFoundPage />} /> */}
                  {/* <Route path="/access-request" element={<AccessRequestPage />} /> */}
                  {/* <Route path="/access-denied" element={<AccessDenied />} /> */}
                  {/* <Route path="/logout" element={<LogOutPage />} /> */}
                  {/* <Route path="/request-submitted" element={<RequestSubmitted />} /> */}
                  {/* <Route path="/user/*" element={<UserRouter />} /> */}
                  {/* <Route path="/admin/*" element={<AdminUsersRouter />} /> */}
                  {/* </Route> */}
                </Routes>
                {/* <Routes>
                  <Route path="/admin" element={<PublicLayout />}> */}
                {/* <Route path="/admin/search" /> */}
                {/* <Route path="/admin/*" element={<AdminUsersRouter />} /> */}
                {/* </Route> */}
                {/* </Routes> */}
              </BrowserRouter>

              // <ReactKeycloakProvider
              //   authClient={keycloak}
              //   initOptions={{ pkceMethod: "S256" }}
              //   LoadingComponent={
              //     <CircularProgress className="pageProgress" size={40} />
              //   }
              // >
              // <AuthStateContextProvider>
              // <BrowserRouter>
              //   <AppRouter />
              // </BrowserRouter>
              // </AuthStateContextProvider>
              // </ReactKeycloakProvider>
            );
          }}
        </ConfigContext.Consumer>
      </ConfigContextProvider>
    </ThemeProvider>
  );
};

export default App;
