import { mdiAccountCircle, mdiHelpCircle, mdiLoginVariant } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import OtherLink from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { SYSTEM_ROLE } from 'constants/roles';
import { ConfigContext } from 'contexts/configContext';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFormattedIdentitySource } from 'utils/Utils';
import { useCodesContext } from 'hooks/useContext';

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
      paddingX: '0.5rem',
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
  const config = useContext(ConfigContext);
  const codes = useCodesContext().codesDataLoader;

  const title =
    codes.data?.branding.find((data) => data.name == 'title')?.value || 'Restoration Tracker';

  const email = codes.data?.branding.find((data) => data.name == 'email')?.value || '';

  const mmm = config?.VERSION ? config.VERSION.split('-')[1] : '0.0.0';
  console.log('***Config', config);
  const nert_version = mmm ?? '0.0.0.NA';
  console.log('***nert_version', nert_version);
  const nert_environment = config?.REACT_APP_NODE_ENV || 'undefined';

  const authStateContext = useAuthStateContext();
  const identitySource = authStateContext.nertUserWrapper.identitySource || '';
  const userIdentifier = authStateContext.nertUserWrapper.userIdentifier || '';
  const formattedUsername = [
    getFormattedIdentitySource(identitySource as SYSTEM_IDENTITY_SOURCE),
    userIdentifier
  ]
    .filter(Boolean)
    .join('/');

  // Authenticated view
  const LoggedInUser = () => {
    return (
      <Box display="flex" sx={pageStyles.userProfile} my="auto" alignItems="center">
        <Icon path={mdiAccountCircle} size={1.12} />
        <Box ml={1}>{formattedUsername}</Box>
        <Box px={2}>
          <Divider orientation="vertical" />
        </Box>
        <Button
          component="a"
          variant="text"
          onClick={() => authStateContext.auth.signoutRedirect()}
          data-testid="menu_log_out"
          sx={{
            color: 'inherit',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none'
          }}>
          Log Out
        </Button>
      </Box>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
    const authStateContext = useAuthStateContext();

    return (
      <>
        <Button
          component="a"
          color="inherit"
          variant="text"
          onClick={() => authStateContext.auth.signinRedirect()}
          disableElevation
          startIcon={<Icon path={mdiLoginVariant} size={1} />}
          data-testid="menu_log_in"
          sx={{
            p: 1,
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none'
          }}>
          Log In
        </Button>
      </>
    );
  };

  const [open, setOpen] = React.useState(false);

  const showSupportDialog = () => {
    handleClose();
    setOpen(true);
  };

  const hideSupportDialog = () => {
    setOpen(false);
  };

  const VersionEnvironmentLabel = () => {
    return (
      <Typography
        sx={pageStyles.appVersionTag}
        variant="subtitle2"
        aria-label={`This application version is ${nert_version} in environment ${nert_environment}`}>
        v{nert_version} {nert_environment}
      </Typography>
    );
  };

  const [infoOpen, setInfoOpen] = useState(false);

  const handleClickOpen = () => {
    setInfoOpen(true);
  };
  const handleClickClose = () => {
    setInfoOpen(false);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (e: any) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="sticky" style={{ boxShadow: 'none' }}>
        <Toolbar variant="dense">
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box display="flex" justifyContent="left">
              <Link to="/" style={pageStyles.brand} aria-label="Go to {title} Home">
                <picture>
                  <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                  <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                  <img src={headerImageSmall} alt={'Government of British Columbia'} />
                </picture>
              </Link>

              <Box ml={2}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  {title}
                </Typography>
                <VersionEnvironmentLabel />
              </Box>
              <Box mt={-0.5}>
                <IconButton aria-label="General Info" onClick={handleClickOpen} size="small">
                  <InfoIcon color="info" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Box display="flex" justifyContent="left" minWidth={100} sx={pageStyles.brand}>
            <UnAuthGuard>
              <PublicViewUser />
            </UnAuthGuard>
            <AuthGuard>
              <LoggedInUser />
            </AuthGuard>
            {/* <Box pl={2}>
              <Divider orientation="vertical" />
            </Box> */}
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              aria-label="need help"
              sx={pageStyles.govHeaderIconButton}
              onClick={handleClick}
              size="large">
              <Icon path={mdiHelpCircle} size={1.12} />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              <MenuItem onClick={handleClose} key={'Tracker FAQ'} value={'Tracker FAQ'}>
                Tracker FAQ
              </MenuItem>
              <MenuItem onClick={showSupportDialog} key={'Need Help'} value={'Need Help'}>
                Need Help
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>

        <Box borderBottom={'1px solid'} sx={pageStyles.mainNav}>
          <Toolbar
            variant="dense"
            sx={pageStyles.mainNavToolbar}
            role="navigation"
            aria-label="Main Navigation">
            <SystemRoleGuard
              validSystemRoles={[
                SYSTEM_ROLE.SYSTEM_ADMIN,
                SYSTEM_ROLE.MAINTAINER,
                SYSTEM_ROLE.PROJECT_CREATOR
              ]}
              fallback={
                <>
                  <Link to="/projects" id="menu_projects">
                    All Projects/All Plans
                  </Link>
                  <Link to="/search" id="menu_search">
                    Map
                  </Link>
                  <AuthGuard>
                    <Link to="/access-request" id="menu_request_access">
                      Request Access
                    </Link>
                  </AuthGuard>
                </>
              }>
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
            </SystemRoleGuard>
          </Toolbar>
        </Box>
      </AppBar>

      <Dialog open={infoOpen}>
        <DialogTitle>General Info: {title}</DialogTitle>
        <DialogContent>
          <Typography>
            The Restoration Tracker is a web application providing planned, active and completed
            restoration project information in a simple, accessible format. Restoration information
            can be used in many ways, such as for restoration project coordination, communication
            and consultation purposes, for other planned activities, for land use planning, and for
            viewing overall restoration activity and investment. Restoration information is entered
            by restoration project planners, implementers, administrators or others involved in the
            process. Find more information and training resources here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleClickClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open}>
        <DialogTitle>Need Help?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" color="textSecondary" gutterBottom>
            For technical support or questions about this application, please email:&nbsp;
            <OtherLink
              href={`mailto:${email}?subject=${title} - Support Request`}
              underline="always">
              {email}
            </OtherLink>
            .
          </Typography>
          <Typography variant="body2">{title}</Typography>
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
