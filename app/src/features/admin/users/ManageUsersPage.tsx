import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import { useNertApi } from 'hooks/useNertApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import React, { useEffect, useState } from 'react';
import ActiveUsersList from './ActiveUsersList';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useCodesContext } from 'hooks/useContext';

/**
 * Page to display user management data/functionality.
 *
 * @return {*}
 */
const ManageUsersPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();

  const [accessRequests, setAccessRequests] = useState<IGetAccessRequestsListResponse[]>([]);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState(false);
  const [hasLoadedAccessRequests, setHasLoadedAccessRequests] = useState(false);

  const [activeUsers, setActiveUsers] = useState<ISystemUser[]>([]);
  const [isLoadingActiveUsers, setIsLoadingActiveUsers] = useState(false);
  const [hasLoadedActiveUsers, setHasLoadedActiveUsers] = useState(false);

  const refreshAccessRequests = async () => {
    const accessResponse = await restorationTrackerApi.admin.getAdministrativeActivities(
      [AdministrativeActivityType.SYSTEM_ACCESS],
      [AdministrativeActivityStatusType.PENDING, AdministrativeActivityStatusType.REJECTED]
    );

    setAccessRequests(accessResponse);
  };

  useEffect(() => {
    const getAccessRequests = async () => {
      const accessResponse = await restorationTrackerApi.admin.getAdministrativeActivities(
        [AdministrativeActivityType.SYSTEM_ACCESS],
        [AdministrativeActivityStatusType.PENDING, AdministrativeActivityStatusType.REJECTED]
      );

      setAccessRequests(() => {
        setHasLoadedAccessRequests(true);
        setIsLoadingAccessRequests(false);
        return accessResponse;
      });
    };

    if (isLoadingAccessRequests || hasLoadedAccessRequests) {
      return;
    }

    setIsLoadingAccessRequests(true);

    getAccessRequests();
  }, [restorationTrackerApi.admin, isLoadingAccessRequests, hasLoadedAccessRequests]);

  const refreshActiveUsers = async () => {
    const activeUsersResponse = await restorationTrackerApi.user.getUsersList();

    setActiveUsers(activeUsersResponse);
  };

  useEffect(() => {
    const getActiveUsers = async () => {
      const activeUsersResponse = await restorationTrackerApi.user.getUsersList();

      setActiveUsers(() => {
        setHasLoadedActiveUsers(true);
        setIsLoadingActiveUsers(false);
        return activeUsersResponse;
      });
    };

    if (hasLoadedActiveUsers || isLoadingActiveUsers) {
      return;
    }

    setIsLoadingActiveUsers(true);

    getActiveUsers();
  }, [restorationTrackerApi, isLoadingActiveUsers, hasLoadedActiveUsers]);

  const codes = useCodesContext().codesDataLoader;

  if (!hasLoadedAccessRequests || !hasLoadedActiveUsers || !codes.data || !codes.isReady) {
    return <CircularProgress className="pageProgress" size={40} aria-label="Loading" />;
  }

  return (
    <Container maxWidth="xl">
      <Box
        mb={5}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        data-testid="manage_users_header"
        sx={{ paddingTop: '20px' }}
        role="region"
        aria-labelledby="manage-users-header">
        <Typography variant="h1" id="manage-users-header">
          Manage Users
        </Typography>
      </Box>

      <Box mb={5}>
        <AccessRequestList
          accessRequests={accessRequests}
          codes={codes.data}
          refresh={() => {
            refreshAccessRequests();
            refreshActiveUsers();
          }}
        />
      </Box>

      <ActiveUsersList activeUsers={activeUsers} codes={codes.data} refresh={refreshActiveUsers} />
    </Container>
  );
};

export default ManageUsersPage;
