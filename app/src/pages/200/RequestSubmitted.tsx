import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useAuth } from 'react-oidc-context';

const RequestSubmitted = () => {
  const auth = useAuth();

  if (!auth) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiCheck} size={2} color="#4caf50" />
        <h1>Access Request Submitted</h1>
        <Typography>Your access request has been submitted for review.</Typography>
        <Box pt={4}>
          <Button
            onClick={() => {
              auth.signoutRedirect();
            }}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            data-testid="logout-button">
            Log Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestSubmitted;
