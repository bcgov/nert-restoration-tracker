import useNertUserWrapper, { INertUserWrapper } from 'hooks/useNertUserWrapper';
import React from 'react';
import { AuthContextProps, useAuth } from 'react-oidc-context';

export interface IAuthState {
  /**
   * The logged in user's Keycloak information.
   *
   * @type {AuthContextProps}
   * @memberof IAuthState
   */
  auth: AuthContextProps;
  /**
   * The logged in user's NERT user information.
   *
   * @type {INertUserWrapper}
   * @memberof IAuthState
   */
  nertUserWrapper: INertUserWrapper;
}

export const AuthStateContext = React.createContext<IAuthState | undefined>(undefined);

export const AuthStateContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const auth = useAuth();

  const nertUserWrapper = useNertUserWrapper();

  return (
    <AuthStateContext.Provider value={{ auth, nertUserWrapper }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
