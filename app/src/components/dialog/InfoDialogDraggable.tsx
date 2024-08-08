import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import Paper, { PaperProps } from '@mui/material/Paper';
import Draggable from 'react-draggable';
import { ICONS } from 'constants/misc';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface ITypeItem {
  typeLabel: string;
  typeIcon: any;
  typeBgColor: string;
}

interface IInfoDialogDraggableProps {
  /**
   * The dialog window is for project or plan.
   *
   * @type {boolean}
   * @memberof IInfoDialogDraggableProps
   */
  isProject: boolean;
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IInfoDialogDraggableProps
   */
  dialogTitle: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IInfoDialogDraggableProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IInfoDialogDraggableProps
   */
  onClose: () => void;
  /**
   * `Dialog` props passthrough.
   *
   * @type {Partial<DialogProps>}
   * @memberof IInfoDialogDraggableProps
   */
  dialogProps?: Partial<DialogProps>;
}

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const InfoDialogDraggable: React.FC<IInfoDialogDraggableProps & React.PropsWithChildren> = (
  props
) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const item: ITypeItem = !props.isProject
    ? { typeLabel: 'Plan', typeIcon: ICONS.PLAN_ICON, typeBgColor: '#FFF4EB' }
    : { typeLabel: 'Project', typeIcon: ICONS.PROJECT_ICON, typeBgColor: '#E9FBFF' };

  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={props.open}
      aria-labelledby="draggable-dialog-title"
      aria-describedby="draggable-dialog-description"
      PaperComponent={PaperComponent}
      {...props.dialogProps}>
      <DialogTitle
        sx={{ m: 0, p: 2, backgroundColor: item.typeBgColor }}
        style={{ cursor: 'move' }}
        id="draggable-dialog-title">
        <Box display="flex" flexDirection={'row'}>
          <CardMedia sx={{ width: 20, height: 32 }} image={item.typeIcon} title={item.typeLabel} />
          <Typography sx={{ mt: 1, ml: 1, fontWeight: 550 }}>
            {item.typeLabel} {props.dialogTitle}
          </Typography>
        </Box>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={props.onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500]
        }}>
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>{props.children}</DialogContent>
      <DialogActions sx={{ backgroundColor: item.typeBgColor }}>
        <Button sx={{ my: -0.5 }} onClick={props.onClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialogDraggable;
