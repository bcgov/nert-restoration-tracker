import Toolbar from "@mui/material/Toolbar";
import React from "react";
import Box from "@mui/material/Box";

const pageStyles = {
  appFooter: {
    backgroundColor: "#003366",
  },
  appVersionTag: {
    position: "absolute",
    marginLeft: "0.5rem",
    color: "#fcba19",
    fontSize: "0.75rem",
    fontWeight: 400,
    right: "1rem",
    marginTop: "-1.5rem",
  },
  appFooterToolbar: {
    minHeight: "46px",
    "& ul": {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      margin: 0,
      padding: 0,
      fontSize: "14px",
      listStyleType: "none",
    },
    "& li + li ": {
      marginLeft: "0.8rem",
      paddingLeft: "0.8rem",
      borderLeft: "1px solid #4b5e7e",
    },
    "& a": {
      color: "#ffffff",
      textDecoration: "none",
    },
    "& a:hover": {
      textDecoration: "underline",
    },
  },
};

// Display the application version and environment
const nert_version = APP_VERSION || "0.0.0.0";
const nert_environment = import.meta.env.DEV
  ? "development"
  : import.meta.env.NODE_ENV || "published";
const VersionEnvironmentLabel = () => {
  return (
    <div
      aria-label={`This application version is ${nert_version} in environment ${nert_environment}`}
    >
      v{nert_version} {nert_environment}
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer style={pageStyles.appFooter}>
      <Toolbar
        sx={pageStyles.appFooterToolbar}
        role="navigation"
        aria-label="Footer"
      >
        <ul>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/disclaimer">
              Disclaimer
            </a>
          </li>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/privacy">
              Privacy
            </a>
          </li>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/accessible-government">
              Accessibility
            </a>
          </li>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/copyright">
              Copyright
            </a>
          </li>
        </ul>
      </Toolbar>
      <Box sx={pageStyles.appVersionTag}>
        <VersionEnvironmentLabel />
      </Box>
    </footer>
  );
};

export default Footer;
