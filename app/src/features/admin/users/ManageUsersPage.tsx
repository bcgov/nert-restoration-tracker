import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import useCodes from 'hooks/useCodes';
import { useNertApi } from 'hooks/useNertApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React, { useEffect, useState } from 'react';
import ActiveUsersList from './ActiveUsersList';

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

  const [activeUsers, setActiveUsers] = useState<IGetUserResponse[]>([]);
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

  const codes = useCodes();

  if (!hasLoadedAccessRequests || !hasLoadedActiveUsers || !codes.codes || !codes.isReady) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Container maxWidth="xl">
      <Box
        mb={5}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ paddingTop: '20px' }}>
        <Typography variant="h1">Manage Users</Typography>
      </Box>

      <Box mb={5}>
        <AccessRequestList
          accessRequests={accessRequests}
          codes={codes.codes}
          refresh={() => {
            refreshAccessRequests();
            refreshActiveUsers();
          }}
        />
      </Box>

      <ActiveUsersList activeUsers={activeUsers} codes={codes.codes} refresh={refreshActiveUsers} />
    </Container>
  );
};

export default ManageUsersPage;
