import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { fireEvent, render, waitFor } from '@testing-library/react';
import ComponentDialog from 'components/dialog/ComponentDialog';
import React from 'react';

const handleOnClose = jest.fn();

const TestComponent = () => {
  return (
    <Box>
      <Typography>This is a test component</Typography>
    </Box>
  );
};

const renderContainer = ({ dialogTitle, open = true }: { dialogTitle: string; open?: boolean }) => {
  return render(
    <div id="root">
      <ComponentDialog dialogTitle={dialogTitle} open={open} onClose={handleOnClose}>
        <TestComponent />
      </ComponentDialog>
    </div>
  );
};

describe('ComponentDialog', () => {
  it('calls the onClose prop when `Close` button is clicked', async () => {
    const { findByText } = renderContainer({ dialogTitle: 'this is a test' });

    const CloseButton = await findByText('Close', { exact: false });

    fireEvent.click(CloseButton);

    await waitFor(() => {
      expect(handleOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
