import { mdiAlertCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const history = useNavigate();
  const authStateContext = useAuthStateContext();

  if (!authStateContext.auth || authStateContext.nertUserWrapper.isLoading) {
    return <CircularProgress className="pageProgress" />;
  }

  const userHasARole = authStateContext.nertUserWrapper.hasOneOrMoreProjectRoles;

  if (userHasARole) {
    // User already has a role
    return <Navigate replace to={{ pathname: '/admin/projects' }} />;
  }

  if (authStateContext.nertUserWrapper.hasAccessRequest) {
    // User already has a pending access request
    return <Navigate replace to={{ pathname: '/request-submitted' }} />;
  }

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiAlertCircleOutline} size={2} color="#ff5252" />
        <h1>Access Denied</h1>
        <Typography>
          {`You do not have permission to access this ${
            (userHasARole && 'page') || 'application'
          }.`}
        </Typography>
        <Box pt={4}>
          {!userHasARole && (
            <Button
              onClick={() => history('/access-request')}
              type="submit"
              size="large"
              variant="contained"
              color="primary"
              data-testid="request_access">
              Request Access
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
