import { render } from '@testing-library/react';
import React from 'react';
import ProjectsLayout from './ProjectsLayout';

describe('ProjectsLayout', () => {
  it.skip('matches the snapshot', () => {
    const { getByText } = render(
      <ProjectsLayout>
        <p>This is the project layout test child component</p>
      </ProjectsLayout>
    );

    expect(getByText('This is the project layout test child component')).toBeVisible();
  });
});
