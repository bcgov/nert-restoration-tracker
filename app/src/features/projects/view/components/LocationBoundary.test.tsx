// import { render, waitFor } from '@testing-library/react';
// import { Feature } from 'geojson';
// import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
// import React from 'react';
// import { getProjectForViewResponse } from 'test-helpers/project-helpers';
// import LocationBoundary from './LocationBoundary';

// jest.mock('../../../../hooks/useRestorationTrackerApi');

// const mockRefresh = jest.fn();

// const mockuseRestorationTrackerApi = {
//   external: {
//     post: jest.fn()
//   }
// };

// const mockRestorationTrackerApi = (
//   useRestorationTrackerApi as unknown as jest.Mock<typeof mockuseRestorationTrackerApi>
// ).mockReturnValue(mockuseRestorationTrackerApi);

describe('LocationBoundary', () => {
  it('Render me a location boundary', async () => {});
});
//   const sharedGeometry: Feature[] = [
//     {
//       type: 'Feature',
//       id: 'myGeo',
//       geometry: {
//         type: 'Polygon',
//         coordinates: [
//           [
//             [-128, 55],
//             [-128, 55.5],
//             [-128, 56],
//             [-126, 58],
//             [-128, 55]
//           ]
//         ]
//       },
//       properties: {
//         name: 'Restoration Islands'
//       }
//     }
//   ];

//   test.skip('matches the snapshot when there is no geometry', async () => {
//     mockRestorationTrackerApi().external.post.mockResolvedValue([]);
//     const { getByTestId } = render(
//       <LocationBoundary
//         projectForViewData={{
//           ...getProjectForViewResponse,
//           location: { ...getProjectForViewResponse.location, geometry: sharedGeometry }
//         }}
//         refresh={mockRefresh}
//       />
//     );

//     await waitFor(() => {
//       expect(getByTestId('map_container')).toBeVisible();
//     });
//   });
// });
