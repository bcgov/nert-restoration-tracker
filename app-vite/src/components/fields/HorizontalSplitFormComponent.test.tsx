import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { render } from '@testing-library/react';
import React from 'react';
import HorizontalSplitFormComponent from './HorizontalSplitFormComponent';

describe('HorizontalSplitFormComponent', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <HorizontalSplitFormComponent
        title="Section title"
        summary="Section summary"
        component={
          <Box>
            <Typography>Hey this is my content</Typography>
          </Box>
        }
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});