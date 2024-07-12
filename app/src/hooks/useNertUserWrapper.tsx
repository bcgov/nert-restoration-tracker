import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { useNertApi } from 'hooks/useNertApi';
import useDataLoader from 'hooks/useDataLoader';
import { useAuth } from 'react-oidc-context';
import { coerceIdentitySource } from 'utils/authUtils';

export interface INertUserWrapper {
  /**
   * Set to `true` if the user's information is still loading, false otherwise.
   */
  isLoading: boolean;
  /**
   * The user's system user id.
   */
  systemUserId: number | undefined;
  /**
   * The user's keycloak guid.
   */
  userGuid: string | null | undefined;
  /**
   * The user's identifier (username).
   */
  userIdentifier: string | undefined;
  /**
   * The user's display name.
   */
  displayName: string | undefined;
  /**
   * The user's email address.
   */
  email: string | undefined;
  /**
   * The user's agency.
   */
  agency: string | null | undefined;
  /**
   * The user's system roles (by name).
   */
  roleNames: string[] | undefined;
  /**
   * The logged in user's identity source (IDIR, BCEID BASIC, BCEID BUSINESS, etc).
   */
  identitySource: SYSTEM_IDENTITY_SOURCE | null;
  /**
   * Set to `true` if the user has at least 1 pending access request, `false` otherwise.
   */
  hasAccessRequest: boolean;
  /**
   * Set to `true` if the user has at least 1 project participant roles, `false` otherwise.
   */
  hasOneOrMoreProjectRoles: boolean;
  /**
   * Force this nert user wrapper to refresh its data.
   */
  refresh: () => void;
}

function useNertUserWrapper(): INertUserWrapper {
  const auth = useAuth();

  const nertApi = useNertApi();

  const nertUserDataLoader = useDataLoader(() => nertApi.user.getUser());

  const administrativeActivityStandingDataLoader = useDataLoader(() =>
    nertApi.admin.getAdministrativeActivityStanding()
  );

  if (auth.isAuthenticated) {
    nertUserDataLoader.load();
    administrativeActivityStandingDataLoader.load();
  }

  const isLoading =
    !nertUserDataLoader.isReady || !administrativeActivityStandingDataLoader.isReady;

  const systemUserId = nertUserDataLoader.data?.id;

  const userGuid =
    nertUserDataLoader.data?.user_guid ||
    (auth.user?.profile?.idir_user_guid as string)?.toLowerCase() ||
    (auth.user?.profile?.bceid_user_guid as string)?.toLowerCase();

  const userIdentifier =
    nertUserDataLoader.data?.user_identifier ||
    (auth.user?.profile?.idir_username as string) ||
    (auth.user?.profile?.bceid_username as string);

  const displayName =
    nertUserDataLoader.data?.display_name || (auth.user?.profile?.display_name as string);

  const email = nertUserDataLoader.data?.email || (auth.user?.profile?.email as string);

  const agency = nertUserDataLoader.data?.agency;

  const roleNames = nertUserDataLoader.data?.role_names;

  const identitySource = coerceIdentitySource(
    nertUserDataLoader.data?.identity_source ||
      (auth.user?.profile?.identity_provider as string)?.toUpperCase()
  );

  const hasAccessRequest =
    !!administrativeActivityStandingDataLoader.data?.has_pending_access_request;

  const hasOneOrMoreProjectRoles =
    !!administrativeActivityStandingDataLoader.data?.has_one_or_more_project_roles;

  const refresh = () => {
    nertUserDataLoader.refresh();
    administrativeActivityStandingDataLoader.refresh();
  };

  return {
    isLoading,
    systemUserId,
    userGuid,
    userIdentifier,
    displayName,
    email,
    agency,
    roleNames,
    identitySource,
    hasAccessRequest,
    hasOneOrMoreProjectRoles,
    refresh
  };
}

export default useNertUserWrapper;
