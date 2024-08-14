import React, { useState } from 'react';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { FormControl } from '@mui/material';
import {
  getNextStates,
  getStatusStyle,
  getStateCodeFromLabel
} from 'components/workflow/StateMachine';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { SYSTEM_ROLE } from 'constants/roles';

interface IChipSelectProps {
  isProject: boolean;
  currentStatus: string;
  formikProps: any;
}

const StatusChip = (props: { status: string }) => {
  return (
    <Chip
      sx={getStatusStyle(getStateCodeFromLabel(props.status))}
      label={props.status}
      size="small"
    />
  );
};

const ChipSelect = (props: IChipSelectProps) => {
  const authStateContext = useAuthStateContext();
  const role = authStateContext.auth.isAuthenticated
    ? authStateContext.nertUserWrapper.roleNames?.find((role) =>
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR].includes(role as SYSTEM_ROLE)
      )
      ? 'admin'
      : 'user'
    : 'public';

  const [value, setValue] = useState('stay in this stage');
  const statusOptions = getNextStates(props.isProject, props.currentStatus, role);
  statusOptions.unshift('stay in this stage');
  const currentCode = getStateCodeFromLabel(props.currentStatus);

  return (
    <FormControl>
      <Select
        sx={{ mt: 0.5 }}
        disableUnderline
        labelId="chip-select-label"
        id="chip-select"
        value={value}
        onChange={({ target: { value } }) => {
          setValue(value);
          if (value != 'stay in this stage')
            props.formikProps.setFieldValue('project.state_code', getStateCodeFromLabel(value));
          else props.formikProps.setFieldValue('project.state_code', currentCode);
        }}
        input={<Input />}
        renderValue={(selected) => <StatusChip status={selected} />}>
        {statusOptions.map((statusLabel) => (
          <MenuItem key={statusLabel} value={statusLabel}>
            <StatusChip status={statusLabel} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ChipSelect;
