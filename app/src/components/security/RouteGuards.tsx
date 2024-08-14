import CircularProgress from '@mui/material/CircularProgress';
import { PROJECT_PERMISSION, PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import React, { useContext, useEffect } from 'react';
import { hasAuthParams } from 'react-oidc-context';
import { Outlet, PathRouteProps, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { hasAtLeastOneValidValue } from 'utils/authUtils';
import { buildUrl } from 'utils/Utils';

export interface ISystemRoleRouteGuardProps extends PathRouteProps {
  /**
   * Indicates the sufficient roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {SYSTEM_ROLE[]}
   */
  validRoles?: SYSTEM_ROLE[];
}

export interface IProjectRoleRouteGuardProps extends PathRouteProps {
  /**
   * Indicates the sufficient project roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {PROJECT_ROLE[]}
   */
  validProjectRoles?: PROJECT_ROLE[];

  /**
   * Indicates the sufficient project permissions needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {PROJECT_PERMISSION[]}
   */
  validProjectPermissions?: PROJECT_PERMISSION[];

  /**
   * Indicates the sufficient system roles that will grant access to this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {SYSTEM_ROLE[]}
   */
  validSystemRoles?: SYSTEM_ROLE[];
}

/**
 * Route guard that requires the user to have at least 1 of the specified system roles.
 *
 * Note: Does not check if they are already authenticated.
 *
 * @param {ISystemRoleRouteGuardProps} props
 * @return {*}
 */
export const SystemRoleRouteGuard = (props: ISystemRoleRouteGuardProps) => {
  const { validRoles } = props;

  const authStateContext = useAuthStateContext();

  if (authStateContext.auth.isLoading || authStateContext.nertUserWrapper.isLoading) {
    // User data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" data-testid="system-role-guard-spinner" />;
  }

  if (!hasAtLeastOneValidValue(validRoles, authStateContext.nertUserWrapper.roleNames)) {
    return <Navigate to="/forbidden" />;
  }

  return <Outlet />;
};

/**
 * Route guard that requires the user to have at least 1 of the specified project roles.
 *
 * Note: Does not check if they are already authenticated.
 *
 * @param {IProjectRoleRouteGuardProps} props
 * @return {*}
 */
export const ProjectRoleRouteGuard = (props: IProjectRoleRouteGuardProps) => {
  const { validSystemRoles, validProjectRoles, validProjectPermissions } = props;

  const authStateContext = useAuthStateContext();

  const projectAuthStateContext = useContext(ProjectAuthStateContext);

  if (!projectAuthStateContext.hasLoadedParticipantInfo) {
    projectAuthStateContext.getProjectParticipant();
  }

  if (
    authStateContext.auth.isLoading ||
    authStateContext.nertUserWrapper.isLoading ||
    !projectAuthStateContext.hasLoadedParticipantInfo
  ) {
    // Participant data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" data-testid="project-role-guard-spinner" />;
  }

  if (
    !projectAuthStateContext.hasProjectRole(validProjectRoles) &&
    !projectAuthStateContext.hasSystemRole(validSystemRoles) &&
    !projectAuthStateContext.hasProjectPermission(validProjectPermissions)
  ) {
    return <Navigate to="/forbidden" />;
  }

  return <Outlet />;
};

/**
 * Route guard that requires the user to be authenticated and registered with nert.
 *
 * @return {*}
 */
export const AuthenticatedRouteGuard = () => {
  const authStateContext = useAuthStateContext();

  const location = useLocation();

  useEffect(() => {
    if (
      !authStateContext.auth.isLoading &&
      !hasAuthParams() &&
      !authStateContext.auth.isAuthenticated &&
      !authStateContext.auth.activeNavigator
    ) {
      // User is not authenticated and has no active authentication navigator, redirect to the keycloak login page
      authStateContext.auth.signinRedirect({
        redirect_uri: buildUrl(window.location.origin, location.pathname)
      });
    }
  }, [authStateContext.auth, location.pathname]);

  if (
    authStateContext.auth.isLoading ||
    authStateContext.nertUserWrapper.isLoading ||
    !authStateContext.auth.isAuthenticated
  ) {
    return (
      <CircularProgress
        className="pageProgress"
        data-testid={'authenticated-route-guard-spinner'}
      />
    );
  }

  if (!authStateContext.nertUserWrapper.systemUserId) {
    // User is not a registered system user

    if (
      authStateContext.nertUserWrapper.hasAccessRequest &&
      !['/request-submitted'].includes(location.pathname)
    ) {
      // The user has a pending access request and isn't already navigating to the request submitted page
      return <Navigate to="/request-submitted" />;
    }

    // The user does not have a pending access request, restrict them to public pages
    if (!['/', '/access-request', '/request-submitted'].includes(location.pathname)) {
      /**
       * User attempted to go to a non-public page. If the request to fetch user data fails, the user
       * can never navigate away from the forbidden page unless they refetch the user data by refreshing
       * the browser. We can preemptively re-attempt to load the user data again each time they attempt to navigate
       * away from the forbidden page.
       */
      authStateContext.nertUserWrapper.refresh();
      // Redirect to forbidden page
      return <Navigate to="/forbidden" />;
    }
  }

  // The user is a registered system user
  return <Outlet />;
};
