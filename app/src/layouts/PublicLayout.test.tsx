import { render } from '@testing-library/react';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from './PublicLayout';

describe('PublicLayout', () => {
  it('renders correctly', () => {
    // process.env.REACT_APP_NODE_ENV = 'local';

    const renderObject = (
      <PublicLayout>
        <div>
          <p>The public layout content</p>
        </div>
      </PublicLayout>
    );

    const routes = [{ path: '/', element: renderObject }];

    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    const { getByText } = render(<RouterProvider router={router}>{renderObject}</RouterProvider>);

    expect(
      getByText('This is an unsupported browser. Some functionality may not work as expected.')
    ).toBeInTheDocument();
  });
});
