import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  it('takes the user home when they click the return home button', () => {
    const routes = [{ path: '/', element: <NotFoundPage /> }];

    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    const { getByText } = render(
      <RouterProvider router={router}>
        <NotFoundPage />
      </RouterProvider>
    );

    fireEvent.click(getByText('Return Home'));

    expect(router.state.location.pathname).toEqual('/');
  });
});
