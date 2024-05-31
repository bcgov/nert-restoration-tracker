import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useFormikContext } from 'formik';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';

export const ScrollToFormikError: React.FC = () => {
  const formikProps = useFormikContext<IGetProjectForViewResponse>();
  const { errors } = formikProps;
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: '' });

  //In order to scroll to top most error, a list needs to be provided of the given order of fields.
  //This is done because formik object errors does not maintain any order in relation to the fields of the page.
  const formikErrorTopDownList = [
    'project.project_name',
    'project.start_date',
    'project.objectives',
    'species.focal_species',
    /^iucn\.classificationDetails\.\[\d+]\.classification$/,
    /^iucn\.classificationDetails\.\[\d+]\.subClassification1$/,
    /^iucn\.classificationDetails\.\[\d+]\.subClassification2$/,
    /^permit\.permits\.\[\d+]\.permit_number$/,
    /^permit\.permits\.\[\d+]\.permit_type$/,
    'location.region',
    'location.geometry'
  ];

  useEffect(() => {
    const showSnackBar = (message: string) => {
      setOpenSnackbar({ open: true, msg: message });
    };

    const getAllFieldErrorNames = (obj: object, prefix = '', result: string[] = []) => {
      Object.keys(obj).forEach((key) => {
        const value = (obj as Record<string, any>)[key];
        if (!value) return;

        key = Number(key) || key === '0' ? `[${key}]` : key;

        const nextKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object') {
          getAllFieldErrorNames(value, nextKey, result);
        } else {
          result.push(nextKey);
        }
      });
      return result;
    };

    const getFirstErrorField = (errorArray: string[]): string | undefined => {
      for (const listError of formikErrorTopDownList) {
        for (const trueError of errorArray) {
          if (trueError.match(listError) || listError === trueError) {
            return trueError;
          }
        }
      }
    };

    const getFieldTitle = (absoluteErrorName: string) => {
      const fieldTitleArray = absoluteErrorName.split('.');
      const fieldTitleSplit = fieldTitleArray[fieldTitleArray.length - 1].split('_');
      let fieldTitleUpperCase = '';
      fieldTitleSplit.forEach((item) => {
        fieldTitleUpperCase += `${item.charAt(0).toUpperCase() + item.slice(1)} `;
      });
      return fieldTitleUpperCase;
    };

    const fieldErrorNames = getAllFieldErrorNames(errors);

    const topFieldError = getFirstErrorField(fieldErrorNames);

    if (!topFieldError) {
      return;
    }

    const fieldTitle = getFieldTitle(topFieldError);
    showSnackBar(`Error Invalid Form Value: ${fieldTitle}`);

    const errorElement = document.getElementsByName(topFieldError);

    if (errorElement.length <= 0) {
      return;
    }

    errorElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [errors]);

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={openSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar({ open: false, msg: '' })}>
        <Alert severity="error">{openSnackbar.msg}</Alert>
      </Snackbar>
    </>
  );
};
