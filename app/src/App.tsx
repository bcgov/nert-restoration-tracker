// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@mui/lab/themeAugmentation'; // this allows `@mui/lab` components to be themed
import CircularProgress from '@mui/material/CircularProgress';
import { StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import AppRouter from 'AppRouter';
import { AuthStateContextProvider } from 'contexts/authStateContext';
import { ConfigContext, ConfigContextProvider } from 'contexts/configContext';
import Keycloak from 'keycloak-js';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import appTheme from 'themes/appTheme';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const App: React.FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={appTheme}>
        <ConfigContextProvider>
          <ConfigContext.Consumer>
            {(config) => {
              if (!config) {
                return <CircularProgress className="pageProgress" size={40} />;
              }

              const keycloak = new Keycloak(config.KEYCLOAK_CONFIG);

              return (
                <ReactKeycloakProvider
                  authClient={keycloak}
                  initOptions={{ pkceMethod: 'S256' }}
                  LoadingComponent={<CircularProgress className="pageProgress" size={40} />}>
                  <AuthStateContextProvider>
                    <BrowserRouter>
                      <AppRouter />
                    </BrowserRouter>
                  </AuthStateContextProvider>
                </ReactKeycloakProvider>
              );
            }}
          </ConfigContext.Consumer>
        </ConfigContextProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
