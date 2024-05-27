import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { isValidElement, PropsWithChildren, ReactElement, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { isAuthenticated } from 'utils/authUtils';

interface IGuardProps {
  /**
   * An optional backup ReactElement to render if the guard fails.
   *
   * @memberof IGuardProps
   */
  fallback?: ((projectId: number) => ReactElement) | ReactElement;
}

interface ISystemRoleGuardProps extends IGuardProps {
  /**
   * An array of valid system roles. The user must have 1 or more matching system roles to pass the guard.
   *
   * @type {SYSTEM_ROLE[]}
   * @memberof ISystemRoleGuardProps
   */
  validSystemRoles: SYSTEM_ROLE[];
}

interface IProjectRoleGuardProps extends IGuardProps {
  /**
   * An array of valid project roles. The user may have 1 or more matching project roles to pass the guard.
   *
   * @type {PROJECT_ROLE[]}
   * @memberof IProjectRoleGuardProps
   */
  validProjectRoles?: PROJECT_ROLE[];
  /**
   * An array of valid system roles. The user may have 1 or more matching system roles to override the guard.
   *
   * @type {SYSTEM_ROLE[]}
   * @memberof IProjectRoleGuardProps
   */
  validSystemRoles?: SYSTEM_ROLE[];
}

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid system roles OR
 * at least 1 of the specified valid project roles.
 *
 * Note: assumes a url param `id` exists and represents a project id.
 *
 * @param {*} props
 * @return {*}
 */
export const RoleGuard = (props: PropsWithChildren<IProjectRoleGuardProps>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const hasSystemRole = keycloakWrapper?.hasSystemRole(props.validSystemRoles);

  if (hasSystemRole) {
    // User has a matching system role
    return <>{props.children}</>;
  }

  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);
  const hasProjectRole = keycloakWrapper?.hasProjectRole(projectId, props.validProjectRoles);

  if (hasProjectRole) {
    // User has a matching project role
    return <>{props.children}</>;
  }

  // User has no matching system role or project role
  if (props.fallback) {
    if (isValidElement(props.fallback)) {
      return <>{props.fallback}</>;
    }
    return <>{props.fallback(projectId)}</>;
  }

  return <></>;
};

/**
 * Renders `props.children` only if the user is NOT authenticated and has none of the specified valid system roles
 *
 * Note: assumes a url param `id` exists and represents a project id.
 *
 * @param {*} props
 * @return {*}
 */
export const NoRoleGuard = (props: PropsWithChildren<IProjectRoleGuardProps>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const hasSystemRole = keycloakWrapper?.hasSystemRole(props.validSystemRoles);

  const { id } = useParams();
  const projectId = Number(id);
  const hasProjectRole = keycloakWrapper?.hasProjectRole(projectId, props.validProjectRoles);

  if (!hasSystemRole && !hasProjectRole) {
    // User has no matching system role or project
    return <>{props.children}</>;
  }

  // User has matching system role or project role
  if (props.fallback) {
    if (isValidElement(props.fallback)) {
      return <>{props.fallback}</>;
    }
    return props.fallback(projectId);
  }

  return <></>;
};

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid system roles.
 *
 * @param {*} props
 * @return {*}
 */
export const SystemRoleGuard = (props: PropsWithChildren<ISystemRoleGuardProps>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const hasSystemRole = keycloakWrapper?.hasSystemRole(props.validSystemRoles);

  if (!hasSystemRole) {
    if (props.fallback) {
      return <>{props.fallback}</>;
    } else {
      return <></>;
    }
  }

  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user is authenticated and has at least 1 of the specified valid project roles.
 *
 * Note: assumes a url param `id` exists and represents a project id.
 *
 * @param {*} props
 * @return {*}
 */
export const ProjectRoleGuard = (props: PropsWithChildren<IProjectRoleGuardProps>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);
  const hasProjectRole = keycloakWrapper?.hasProjectRole(projectId, props.validProjectRoles);

  if (!hasProjectRole) {
    // User has no matching project role
    if (props.fallback) {
      return <>{props.fallback}</>;
    } else {
      return <></>;
    }
  }

  // User has a matching project role
  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user is authenticated (logged in).
 *
 * @param {*} props
 * @return {*}
 */
export const AuthGuard = (props: PropsWithChildren<IGuardProps>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!isAuthenticated(keycloakWrapper)) {
    // User is not logged in
    if (props.fallback) {
      return <>{props.fallback}</>;
    } else {
      return <></>;
    }
  }

  // User is logged in
  return <>{props.children}</>;
};

/**
 * Renders `props.children` only if the user is not authenticated (logged in).
 *
 * @param {*} props
 * @return {*}
 */
export const UnAuthGuard = (props: PropsWithChildren<IGuardProps>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!isAuthenticated(keycloakWrapper)) {
    // User is not logged in
    return <>{props.children}</>;
  }

  // User is logged in
  if (props.fallback) {
    return <>{props.fallback}</>;
  }

  return <></>;
};
