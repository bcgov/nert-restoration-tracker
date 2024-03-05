import { mdiArrowRight, mdiDoorClosedLock, mdiDoorOpen } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext, useEffect } from 'react';
import { getLogOutUrl } from 'utils/Utils';

const pageStyles = {
  icon: {
    color: 'darkblue'
  }
};

const LogOutPage = () => {
  const config = useContext(ConfigContext);

  useEffect(() => {
    if (!config) {
      return;
    }

    const logOutURL = getLogOutUrl(config);

    if (!logOutURL) {
      return;
    }

    window.location.replace(logOutURL);
  }, [config]);

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiDoorOpen} size={2} color={pageStyles.icon.color} />
        <Icon path={mdiArrowRight} size={2} color={pageStyles.icon.color} />
        <Icon path={mdiDoorClosedLock} size={2} color={pageStyles.icon.color} />
        <h1>Logging out...</h1>
      </Box>
    </Container>
  );
};

export default LogOutPage;
