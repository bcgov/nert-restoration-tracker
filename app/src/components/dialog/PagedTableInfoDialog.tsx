import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { Fragment, useContext, useState } from 'react';
import ReactPlayer from 'react-player/file';
import { isAuthenticated } from 'utils/authUtils';

interface IPagedTableInfoDialogProps {
  isProject: boolean;
}

const VideoDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}));

const PagedTableInfoDialog: React.FC<IPagedTableInfoDialogProps> = (props) => {
  const [isError, setIsError] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleError = (error: any) => {
    console.error('Error playing media', error);
    setIsError(true);
  };

  const { keycloakWrapper } = useContext(AuthStateContext);
  const userPath = isAuthenticated(keycloakWrapper)
    ? keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN])
      ? 'auth/admin'
      : 'auth/user'
    : 'public';
  const typeLabel = !props.isProject ? 'Plan' : 'Project';

  return (
    <Fragment>
      <Tooltip title={`${typeLabel} Information`} placement="right">
        <IconButton onClick={handleClickOpen}>
          <InfoIcon color="info" />
        </IconButton>
      </Tooltip>

      <VideoDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="xl"
        scroll="paper">
        <DialogTitle
          sx={{ m: 0, p: 2, backgroundColor: !props.isProject ? '#FFF4EB' : '#E9FBFF' }}
          id="customized-dialog-title">
          {typeLabel} table usage
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {isError ? (
            <Alert variant="outlined" severity="error">
              Error playing media
            </Alert>
          ) : (
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <ReactPlayer
                url={`https://${process.env.REACT_APP_OBJECT_STORE_URL}/${process.env.REACT_APP_OBJECT_STORE_BUCKET_NAME}/info/${userPath}/${typeLabel}PagedTableInfo.mp4`}
                style={{ position: 'absolute', top: 0, left: 0 }}
                playing={true}
                loop={true}
                controls={false}
                width="100%"
                height="100%"
                onError={(e) => handleError(e)}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: !props.isProject ? '#FFF4EB' : '#E9FBFF' }}>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </VideoDialog>
    </Fragment>
  );
};

export default PagedTableInfoDialog;
