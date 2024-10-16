import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from '@mui/material';
import { checkCodeType, CodeType, CombinedCode } from 'interfaces/useCodesApi.interface';
import React, { useState } from 'react';

interface CodeDialogProps {
  open: boolean;
  onClose: () => void;
  handleUpdate: (type: CodeType, updatedCodeSet: CombinedCode) => void;
  codeSet: CombinedCode | null;
  title: string;
  type: CodeType | undefined;
}

const CodeDialog: React.FC<CodeDialogProps> = ({
  open,
  onClose,
  handleUpdate,
  codeSet,
  title,
  type
}) => {
  if (!codeSet || !type) {
    return null;
  }

  const [value, setValue] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    if (type === CodeType.BRANDING && codeSet.name == 'email') {
      if (validateEmail(value)) {
        setConfirmOpen(true);
        return;
      }
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmUpdate = () => {
    if (!codeSet || !type || !value) {
      return;
    }

    if (type === CodeType.BRANDING) {
      handleUpdate(type, { ...codeSet, value: value, name: codeSet.name, id: codeSet.id });
    } else {
      handleUpdate(type, { ...codeSet, name: codeSet.name, id: codeSet.id });
    }

    setValue('');
    setConfirmOpen(false);
    onClose();
  };

  const validateEmail = (email: string) => {
    // don't remember from where i copied this code, but this works.
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
  };

  const handleCancel = () => {
    setValue('');
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} aria-labelledby="code-dialog-title">
        <DialogTitle id="code-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{`Type: ${type ? type.toLocaleUpperCase() : ''}`}</Typography>
          <Typography variant="body1">{`Code: ${codeSet.name}`}</Typography>
          <Typography variant="body1">{`Value: ${checkCodeType(codeSet)}`}</Typography>
          <br />
          {type === CodeType.BRANDING && codeSet.name == 'email' ? (
            <TextField
              label="Update Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
              error={value.length > 5 && !validateEmail(value)}
              helperText={value.length > 5 && !validateEmail(value) && 'Invalid email address'}
              type="email"
              inputProps={{ maxLength: 50 }}
              aria-label="Update Email Value"
            />
          ) : (
            <TextField
              label="Update Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
              inputProps={{ maxLength: 50 }}
              aria-label="Update Value"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleConfirm} color="primary">
            Update
          </Button>
          <Button variant="contained" onClick={handleCancel} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-dialog-title">
        <DialogTitle id="confirm-dialog-title">Confirm Update</DialogTitle>
        <DialogContent>Are you sure you want to update the code?</DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleConfirmUpdate} color="primary">
            Confirm
          </Button>
          <Button variant="contained" onClick={() => setConfirmOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CodeDialog;
