import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { useNertApi } from 'hooks/useNertApi';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjects from './UsersDetailProjects';
import { ISystemUser } from 'interfaces/useUserApi.interface';

/**
 * Page to display user details.
 *
 * @return {*}
 */
const UsersDetailPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  console.log('restorationTrackerApi', restorationTrackerApi);

  const [selectedUser, setSelectedUser] = useState<ISystemUser | null>(null);
  console.log('selectedUser', selectedUser);

  const urlParams: Record<string, string | number | undefined> = useParams();
  useEffect(() => {
    if (selectedUser) {
      return;
    }

    const getUser = async () => {
      const id = Number(urlParams['id']);
      const user = await restorationTrackerApi.user.getUserById(id);
      setSelectedUser(user);
    };
    console.log('urlParams[asd]', urlParams['id']);

    getUser();
  }, [restorationTrackerApi.user, urlParams, selectedUser]);

  if (!selectedUser) {
    return <CircularProgress data-testid="page-loading" className="pageProgress" size={40} />;
  }

  return (
    <Container maxWidth="xl">
      <UsersDetailHeader userDetails={selectedUser} />
      <Box my={3}>
        <UsersDetailProjects userDetails={selectedUser} />
      </Box>
    </Container>
  );
};

export default UsersDetailPage;
