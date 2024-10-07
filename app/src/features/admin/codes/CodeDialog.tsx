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
  const [value, setValue] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
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

  const handleCancel = () => {
    setValue('');
    setConfirmOpen(false);
    onClose();
  };

  if (!codeSet) {
    return;
  }

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{`Type: ${type ? type.toLocaleUpperCase() : ''}`}</Typography>
          <Typography variant="body1">{`Code: ${codeSet.name}`}</Typography>
          <Typography variant="body1">{`Value: ${checkCodeType(codeSet)}`}</Typography>
          <br />
          <TextField
            label="Update Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 50 }}
          />
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
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
