import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import { AuthStateContext } from "../../contexts/authStateContext";
import React, { useContext } from "react";
import { Redirect } from "react-router";
// import PublicPlansListPage from './list/PublicPlansListPage';
import PublicProjectsListPage from "./list/PublicProjectsListPage";

const PublicProjectsPlansListPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (keycloakWrapper?.keycloak.authenticated) {
    // User has a role
    return <Redirect to={{ pathname: "/admin/projects" }} />;
  }

  return (
    <Container maxWidth="xl">
      <PublicProjectsListPage />
      <Box mt={1} mb={1}>
        <Divider aria-hidden="true" color="lightgray" />
      </Box>
      {/* <PublicPlansListPage /> */}
    </Container>
  );
};

export default PublicProjectsPlansListPage;
