import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouter } from 'AppRouter';
import { AuthStateContextProvider } from 'contexts/authStateContext';
import { ConfigContext } from 'contexts/configContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { MapStateContextProvider } from 'contexts/mapContext';
import { WebStorageStateStore } from 'oidc-client-ts';
import React, { useContext } from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import appTheme from 'themes/appTheme';
import { buildUrl } from 'utils/Utils';

const App: React.FC = () => {
  const configContext = useContext(ConfigContext);

  if (!configContext) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const logoutRedirectUri = configContext.SITEMINDER_LOGOUT_URL
    ? `${configContext.SITEMINDER_LOGOUT_URL}?returl=${window.location.origin}&retnow=1`
    : buildUrl(window.location.origin);

  const authConfig: AuthProviderProps = {
    authority: `${configContext.KEYCLOAK_CONFIG.url}/realms/${configContext.KEYCLOAK_CONFIG.realm}/`,
    client_id: configContext.KEYCLOAK_CONFIG.clientId,
    resource: configContext.KEYCLOAK_CONFIG.clientId,
    // Default sign in redirect
    redirect_uri: buildUrl(window.location.origin),
    // Default sign out redirect
    post_logout_redirect_uri: logoutRedirectUri,
    automaticSilentRenew: true,
    // Automatically load additional user profile information
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    onSigninCallback: (): void => {
      // See https://github.com/authts/react-oidc-context#getting-started
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <AuthProvider {...authConfig}>
      <ThemeProvider theme={appTheme}>
        <AuthStateContextProvider>
          <MapStateContextProvider>
            <DialogContextProvider>
              <AppRouter />
            </DialogContextProvider>
          </MapStateContextProvider>
        </AuthStateContextProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
