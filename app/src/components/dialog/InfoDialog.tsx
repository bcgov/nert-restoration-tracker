import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ICONS } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { ConfigContext } from 'contexts/configContext';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import React, { Fragment, useContext, useState } from 'react';
import ReactPlayer from 'react-player/file';

interface IInfoDialogProps {
  isProject: boolean;
  infoContent: string;
}

interface ITypeItem {
  typeLabel: string;
  typeIcon: any;
  typeBgColor: string;
}

const VideoDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}));

const InfoDialog: React.FC<IInfoDialogProps> = (props) => {
  const { isProject, infoContent } = props;

  const config = useContext(ConfigContext);

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

  const authStateContext = useAuthStateContext();
  const userPath = authStateContext.auth.isAuthenticated
    ? authStateContext.nertUserWrapper.roleNames?.find((role) =>
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR].includes(role as SYSTEM_ROLE)
      )
      ? 'auth/admin'
      : 'auth/user'
    : 'public';
  const item: ITypeItem = !isProject
    ? { typeLabel: 'Plan', typeIcon: ICONS.PLAN_ICON, typeBgColor: '#FFF4EB' }
    : { typeLabel: 'Project', typeIcon: ICONS.PROJECT_ICON, typeBgColor: '#E9FBFF' };

  return (
    <Fragment>
      <Tooltip title={`${item.typeLabel} ${infoContent}`} placement="right">
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
          sx={{ m: 0, p: 2, backgroundColor: item.typeBgColor }}
          id="customized-dialog-title">
          <Box display="flex" flexDirection={'row'}>
            <CardMedia
              sx={{ width: 20, height: 32 }}
              image={item.typeIcon}
              title={item.typeLabel}
            />
            <Typography sx={{ mt: 1, ml: 1, fontWeight: 550 }}>
              {item.typeLabel} {infoContent}
            </Typography>
          </Box>
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
                url={`https://${config?.REACT_APP_OBJECT_STORE_URL}/${
                  config?.REACT_APP_OBJECT_STORE_BUCKET_NAME
                }/info/${userPath}/${item.typeLabel}${infoContent.replace(' ', '')}Info.mp4`}
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
        <DialogActions sx={{ backgroundColor: item.typeBgColor }}>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </VideoDialog>
    </Fragment>
  );
};

export default InfoDialog;
