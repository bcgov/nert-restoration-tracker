import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { useNertApi } from 'hooks/useNertApi';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjectsPlans from 'features/admin/users/UsersDetailProjectsPlans';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import UserDetailDraftsList from './UserDetailDraftsList';

/**
 * Page to display user details.
 *
 * @return {*}
 */
const UsersDetailPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ISystemUser | null>(null);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);

  const urlParams: Record<string, string | number | undefined> = useParams();
  const userId = Number(urlParams['id']);

  useEffect(() => {
    if (selectedUser && drafts) {
      return;
    }

    const getUser = async () => {
      const user = await restorationTrackerApi.user.getUserById(userId);
      setSelectedUser(() => {
        setIsLoading(false);
        return user;
      });
    };

    const getUserDrafts = async () => {
      const draftsResponse = await restorationTrackerApi.draft.getUserDraftsList(userId);
      setDrafts(() => {
        setIsLoading(false);
        return draftsResponse;
      });
    };

    if (isLoading) {
      getUser();
      getUserDrafts();
    }
  }, [restorationTrackerApi.user, selectedUser, drafts, isLoading]);

  if (!selectedUser || !drafts) {
    return <CircularProgress data-testid="page-loading" className="pageProgress" size={40} />;
  }

  return (
    <Container maxWidth="xl">
      <UsersDetailHeader userDetails={selectedUser} />
      <Box my={3}>
        <UsersDetailProjectsPlans userDetails={selectedUser} />
      </Box>
      <UserDetailDraftsList drafts={drafts} />
    </Container>
  );
};

export default UsersDetailPage;
