import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import { DialogContextProvider } from "../contexts/dialogContext";
import { Outlet } from "react-router-dom";
import React from "react";

const PublicLayout: React.FC = (props) => {
  function isSupportedBrowser() {
    if (
      navigator.userAgent.indexOf("Chrome") !== -1 ||
      navigator.userAgent.indexOf("Firefox") !== -1 ||
      navigator.userAgent.indexOf("Safari") !== -1 ||
      navigator.userAgent.indexOf("Edge") !== -1
    ) {
      return true;
    }

    return false;
  }

  return (
    <Box height="100vh" width="100vw" display="flex" flexDirection="column">
      <CssBaseline />
      {/* @ts-ignore  */}
      <DialogContextProvider>
        {!isSupportedBrowser() && (
          <Alert severity="error">
            This is an unsupported browser. Some functionality may not work as
            expected.
          </Alert>
        )}

        <Header />

        <Outlet />

        <Footer />
      </DialogContextProvider>
    </Box>
  );
};

export default PublicLayout;
