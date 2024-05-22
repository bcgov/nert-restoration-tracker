import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Footer from 'components/layout/Footer';
import Header from 'components/layout/Header';
import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC<{ children: any }> = () => {
  function isSupportedBrowser() {
    if (
      navigator.userAgent.indexOf('Chrome') !== -1 ||
      navigator.userAgent.indexOf('Firefox') !== -1 ||
      navigator.userAgent.indexOf('Safari') !== -1 ||
      navigator.userAgent.indexOf('Edge') !== -1
    ) {
      return true;
    }

    return false;
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      {!isSupportedBrowser() && (
        <Alert
          severity="error"
          sx={{
            color: 'primary.main',
            backgroundColor: '#fcba19'
          }}>
          This is an unsupported browser. Some functionality may not work as expected.
        </Alert>
      )}

      <Header />

      <Box component="main" flex="1 1 auto" py={4} sx={{ padding: 0 }}>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
};

export default PublicLayout;
