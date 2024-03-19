import { mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { AuthStateContext } from "../../contexts/authStateContext";
import React, { useContext } from "react";
import { Navigate, useNavigate } from "react-router";

const RequestSubmitted = () => {
  const navigate = useNavigate();

  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!keycloakWrapper?.hasLoadedAllUserInfo) {
    // User data has not been loaded, can not yet determine if they have a role
    return <CircularProgress className="pageProgress" />;
  }

  if (keycloakWrapper?.systemRoles.length) {
    // User already has a role
    return <Navigate to={{ pathname: "/admin/projects" }} />;
  }

  if (!keycloakWrapper.hasAccessRequest) {
    // User has no pending access request
    return <Navigate to={{ pathname: "/" }} />;
  }

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiCheck} size={2} color="#4caf50" />
        <h1>Access Request Submitted</h1>
        <Typography>
          Your access request has been submitted for review.
        </Typography>
        <Box pt={4}>
          <Button
            onClick={() => {
              navigate("/logout");
            }}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            data-testid="logout-button"
          >
            Log Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestSubmitted;