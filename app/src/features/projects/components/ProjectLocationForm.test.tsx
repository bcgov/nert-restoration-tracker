// import {
//   IProjectLocationForm,
//   ProjectLocationFormInitialValues,
//   ProjectLocationFormYupSchema
// } from './ProjectLocationForm';

describe.skip('ProjectLocationForm', () => {
  it('renders correctly with default empty values', async () => {});
});
// describe.skip('ProjectLocationForm', () => {
//   it('renders correctly with default empty values', async () => {
//     const { asFragment } = render(
//       <Formik
//         initialValues={ProjectLocationFormInitialValues}
//         validationSchema={ProjectLocationFormYupSchema}
//         validateOnBlur={true}
//         validateOnChange={false}
//         onSubmit={async () => {}}>
//         {() => (
//           // <ProjectLocationForm
//           //   ranges={codes.ranges.map((item) => {
//           //     return { value: item.id, label: item.name };
//           //   })}
//           //   regions={codes.regions.map((item) => {
//           //     return { value: item.id, label: item.name };
//           //   })}
//           // />
//           <></>
//         )}
//       </Formik>
//     );

//     await waitFor(() => {
//       expect(asFragment()).toMatchSnapshot();
//     });
//   });

//   it('renders correctly with existing location values', async () => {
//     const existingFormValues: IProjectLocationForm = {
//       location: {
//         geometry: [
//           {
//             type: 'Feature',
//             geometry: {
//               type: 'Point',
//               coordinates: [125.6, 10.1]
//             },
//             properties: {
//               name: 'Dinagat Islands'
//             }
//           }
//         ],
//         range: 1,
//         region: 1,
//         priority: 'false'
//       }
//     };

//     const { asFragment } = render(
//       <Formik
//         initialValues={existingFormValues}
//         validationSchema={ProjectLocationFormYupSchema}
//         validateOnBlur={true}
//         validateOnChange={false}
//         onSubmit={async () => {}}>
//         {() => (
//           // <ProjectLocationForm
//           //   ranges={codes.ranges.map((item) => {
//           //     return { value: item.id, label: item.name };
//           //   })}
//           //   regions={codes.regions.map((item) => {
//           //     return { value: item.id, label: item.name };
//           //   })}
//           // />
//           <></>
//         )}
//       </Formik>
//     );

//     await waitFor(() => {
//       expect(asFragment()).toMatchSnapshot();
//     });
//   });

//   it('renders correctly with errors on fields', async () => {
//     const existingFormValues: IProjectLocationForm = {
//       location: {
//         geometry: [
//           {
//             type: 'Feature',
//             geometry: {
//               type: 'Point',
//               coordinates: [125.6, 10.1]
//             },
//             properties: {
//               name: 'Dinagat Islands'
//             }
//           }
//         ],
//         range: 1,
//         region: 1,
//         priority: 'false'
//       }
//     };

//     const { asFragment } = render(
//       <Formik
//         initialValues={existingFormValues}
//         validationSchema={ProjectLocationFormYupSchema}
//         validateOnBlur={true}
//         validateOnChange={false}
//         initialErrors={{ range: 'error is here' }}
//         initialTouched={{ range: true }}
//         onSubmit={async () => {}}>
//         {() => (
//           // <ProjectLocationForm
//           //   ranges={codes.ranges.map((item) => {
//           //     return { value: item.id, label: item.name };
//           //   })}
//           //   regions={codes.regions.map((item) => {
//           //     return { value: item.id, label: item.name };
//           //   })}
//           // />
//           <></>
//         )}
//       </Formik>
//     );

//     await waitFor(() => {
//       expect(asFragment()).toMatchSnapshot();
//     });
//   });
// });
