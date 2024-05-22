import { mdiAccountCircle, mdiHelpCircle, mdiLoginVariant } from '@mdi/js';
import Icon from '@mdi/react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import OtherLink from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { getFormattedIdentitySource } from 'utils/Utils';

const nert_version = process.env.REACT_APP_NERT_VERSION || '0.0.0.0';
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
console.log('process.env.REACT_APP_NODE_ENV', process.env.REACT_APP_NODE_ENV);
const nert_environment =
  process.env.REACT_APP_NODE_ENV === 'development'
    ? 'local'
    : process.env.REACT_APP_NODE_ENV || 'undefined';

const pageStyles = {
  govHeaderToolbar: {
    height: '70px'
  },
  brand: {
    display: 'flex',
    flex: '0 0 auto',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    fontSize: '1.25rem',
    fontWeight: 700,
    '& img': {
      verticalAlign: 'middle'
    },
    '& picture': {
      marginRight: '1.25rem'
    },
    '&:hover': {
      textDecoration: 'none'
    },
    '&:focus': {
      outlineOffset: '6px'
    }
  },
  '@media (max-width: 1000px)': {
    brand: {
      fontSize: '1rem',
      '& picture': {
        marginRight: '1rem'
      }
    },
    wrapText: {
      display: 'block'
    }
  },
  appVersionTag: {
    marginLeft: '0.5rem',
    color: '#fcba19',
    fontSize: '0.75rem',
    fontWeight: 400
  },
  userProfile: {
    color: 'white',
    fontSize: '0.9375rem',
    '& hr': {
      backgroundColor: '#4b5e7e',
      height: '1rem'
    },
    '& a': {
      color: 'inherit',
      textDecoration: 'none'
    },
    '& a:hover': {
      textDecoration: 'underline'
    }
  },
  govHeaderIconButton: {
    color: '#ffffff'
  },
  mainNav: {
    backgroundColor: '#38598a'
  },
  mainNavToolbar: {
    '& a': {
      display: 'block',
      padding: '1rem',
      color: 'inherit',
      fontSize: '1rem',
      textDecoration: 'none'
    },
    '& a:hover': {
      textDecoration: 'underline',
      backgroundColor: (theme: {
        palette: { primary: { main: string }; action: { activatedOpacity: number } };
      }) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
    },
    '& a:first-of-type': {
      marginLeft: '-1rem'
    }
  },
  '.MuiDialogContent-root': {
    '& p + p': {
      marginTop: '1rem'
    }
  }
};

const Header: React.FC = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  // Authenticated view
  const LoggedInUser = () => {
    const identitySource = keycloakWrapper?.getIdentitySource() || '';
    const userIdentifier = keycloakWrapper?.getUserIdentifier() || '';
    const formattedUsername = [
      getFormattedIdentitySource(identitySource as SYSTEM_IDENTITY_SOURCE),
      userIdentifier
    ]
      .filter(Boolean)
      .join('/');

    return (
      <Box display="flex" sx={pageStyles.userProfile} my="auto" alignItems="center">
        <Icon path={mdiAccountCircle} size={1.12} />
        <Box ml={1}>{formattedUsername}</Box>
        <Box px={2}>
          <Divider orientation="vertical" />
        </Box>
        <Link to="/logout" data-testid="menu_log_out">
          Log Out
        </Link>
        <Box pl={2}>
          <Divider orientation="vertical" />
        </Box>
        <IconButton
          aria-label="need help"
          sx={pageStyles.govHeaderIconButton}
          onClick={showSupportDialog}
          size="large"
        >
          <Icon path={mdiHelpCircle} size={1.12} />
        </IconButton>
      </Box>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
    return (
      <Box display="flex" sx={pageStyles.userProfile} alignItems="center" my="auto">
        <Button
          onClick={() => keycloakWrapper?.keycloak.login()}
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          startIcon={<Icon path={mdiLoginVariant} size={1.12} />}
          data-testid="login"
        >
          Log In
        </Button>
        <IconButton sx={pageStyles.govHeaderIconButton} onClick={showSupportDialog} size="large">
          <Icon path={mdiHelpCircle} size={1.12} />
        </IconButton>
      </Box>
    );
  };

  const [open, setOpen] = React.useState(false);

  const showSupportDialog = () => {
    setOpen(true);
  };

  const hideSupportDialog = () => {
    setOpen(false);
  };

  const VersionEnvironmentLabel = () => {
    return (
      <span
        aria-label={`This application version is ${nert_version} in environment ${nert_environment}`}
      >
        v{nert_version} {nert_environment}
      </span>
    );
  };

  return (
    <>
      <AppBar position="sticky" style={{ boxShadow: 'none' }}>
        <Toolbar sx={pageStyles.govHeaderToolbar}>
          <Box display="flex" justifyContent="space-between" width="100%" sx={pageStyles.brand}>
            <Link
              to="/"
              style={pageStyles.brand}
              aria-label="Go to Northeast Restoration Tracker Home"
            >
              <picture>
                <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                <img src={headerImageSmall} alt={'Government of British Columbia'} />
              </picture>
              <span>
                Northeast Restoration Tracker
                <sup style={pageStyles.appVersionTag}>
                  <VersionEnvironmentLabel />
                </sup>
              </span>
            </Link>
            <UnAuthGuard>
              <PublicViewUser />
            </UnAuthGuard>
            <AuthGuard>
              <LoggedInUser />
            </AuthGuard>
          </Box>
        </Toolbar>

        <Box sx={pageStyles.mainNav}>
          <Toolbar
            variant="dense"
            sx={pageStyles.mainNavToolbar}
            role="navigation"
            aria-label="Main Navigation"
          >
            <UnAuthGuard>
              <Link to="/projects" id="menu_projects">
                All Projects/All Plans
              </Link>
              <Link to="/search" id="menu_search">
                Map
              </Link>
            </UnAuthGuard>
            <AuthGuard>
              <Link to="/admin/projects" id="menu_projects">
                All Projects/All Plans
              </Link>
              <Link to="/admin/user/projects" id="menu_user_projects">
                My Projects/My Plans
              </Link>
              <Link to="/admin/search" id="menu_search">
                Map
              </Link>
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
                <Link to="/admin/users" id="menu_admin_users">
                  Manage Users
                </Link>
              </SystemRoleGuard>
            </AuthGuard>
          </Toolbar>
        </Box>
      </AppBar>

      <Dialog open={open}>
        <DialogTitle>Need Help?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" color="textSecondary" gutterBottom>
            For technical support or questions about this application, please email:&nbsp;
            <OtherLink
              href="mailto:oinostro@gov.bc.ca?subject=Northeast Restoration Tracker - Support Request"
              underline="always"
            >
              oinostro@gov.bc.ca
            </OtherLink>
            .
          </Typography>
          <Typography variant="body2">Northeast Restoration Tracker</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Version: {nert_version} Environment: {nert_environment}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={hideSupportDialog}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
