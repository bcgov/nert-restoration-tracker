import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { AuthStateContext } from "../../contexts/authStateContext";
import React, { useContext } from "react";
import { Popup } from "react-leaflet";
import { useNavigate } from "react-router";
import { isAuthenticated } from "../../utils/authUtils";

export const SearchFeaturePopup: React.FC<{ featureData: any }> = (props) => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const navigate = useNavigate();

  const { featureData } = props;

  return (
    <Popup
      key={featureData.id}
      keepInView={false}
      autoPan={false}
      closeButton={false}
    >
      <Box mb={2}>
        <Typography variant="body1">Project: {featureData.name}</Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          if (isAuthenticated(keycloakWrapper)) {
            navigate(`/admin/projects/${featureData.id}`);
          } else {
            navigate(`/projects/${featureData.id}`);
          }
        }}
      >
        View Project Details
      </Button>
    </Popup>
  );
};
