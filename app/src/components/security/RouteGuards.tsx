import CircularProgress from '@mui/material/CircularProgress';
import { PROJECT_PERMISSION, PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import React, { useContext } from 'react';
import { Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { hasAtLeastOneValidValue } from 'utils/authUtils';

export interface ISystemRoleRouteGuardProps {
  /**
   * Indicates the sufficient roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {SYSTEM_ROLE[]}
   */
  validRoles?: SYSTEM_ROLE[];
  /**
   * The children to render if the user has the required roles.
   *
   * @type {JSX.Element}
   * @memberof ISystemRoleRouteGuardProps
   */
  children?: JSX.Element;
}

export interface IProjectRoleRouteGuardProps {
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
  /**
   * The children to render if the user has the required roles.
   *
   * @type {JSX.Element}
   * @memberof ISystemRoleRouteGuardProps
   */
  children?: JSX.Element;
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
  const { validRoles, children, ...rest } = props;

  const authStateContext = useAuthStateContext();

  if (authStateContext.auth.isLoading || authStateContext.nertUserWrapper.isLoading) {
    // User data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" data-testid="system-role-guard-spinner" />;
  }

  if (!hasAtLeastOneValidValue(validRoles, authStateContext.nertUserWrapper.roleNames)) {
    return <Navigate to="/forbidden" />;
  }

  return <Route {...rest}>{children}</Route>;
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
  const { validSystemRoles, validProjectRoles, validProjectPermissions, children, ...rest } = props;

  const authStateContext = useAuthStateContext();

  const projectAuthStateContext = useContext(ProjectAuthStateContext);

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

  return <Route {...rest}>{children}</Route>;
};
