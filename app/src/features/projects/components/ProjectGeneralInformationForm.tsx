import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';

import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ProjectStartEndDateFields from 'components/fields/ProjectStartEndDateFields';
import { getStateCodeFromLabel, getStatusStyle, states } from 'components/workflow/StateMachine';
import { useFormikContext } from 'formik';

import FileUpload from 'components/attachments/FileUpload';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';

import './styles/projectImage.css';

export interface IProjectGeneralInformationForm {
  project: {
    project_name: string;
    is_project: boolean;
    state_code: number;
    brief_desc: string;
    start_date: string;
    end_date: string;
    actual_start_date: string;
    actual_end_date: string;
    is_healing_land: boolean;
    is_healing_people: boolean;
    is_land_initiative: boolean;
    is_cultural_initiative: boolean;
    people_involved: number | null;
    project_image: string;
  };
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project: {
    project_name: '',
    is_project: true,
    state_code: getStateCodeFromLabel(states.DRAFT),
    brief_desc: '',
    start_date: '',
    end_date: '',
    actual_start_date: '',
    actual_end_date: '',
    is_healing_land: false,
    is_healing_people: false,
    is_land_initiative: false,
    is_cultural_initiative: false,
    people_involved: null,
    project_image: ''
  }
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().nullable().isValidDateString(),
    end_date: yup.string().nullable().isValidDateString().isEndDateAfterStartDate('start_date'),
    brief_desc: yup
      .string()
      .max(500, 'Cannot exceed 500 characters')
      .required('You must provide a brief description for the project')
  })
});

// Fixing a lame typescript error
const fitObject = 'cover' as const;
const positionAbsolute = 'absolute' as const;
const positionRelative = 'relative' as const;

const uploadImageStyles = {
  general: {
    position: positionRelative,
    marginTop: '23px',
    maxWidth: '230px'
  },
  description: {
    fontSize: '12px',
    color: '#6E6E6E',
    marginBottom: '2px'
  },
  thumbnail: {
    border: '1px solid #0008',
    borderRadius: '25px',
    overflow: 'hidden',
    height: '200px',
    width: '100%',
    objectFit: fitObject
  },
  thumbnailDelete: {
    position: positionAbsolute,
    top: '28px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    borderRadius: '50%',
    padding: '5px 7px',
    cursor: 'pointer',
    opacity: 0.5,
    transition: 'all ease-out 0.2s',
    zIndex: 1
  }
};

const uploadImage = (setImage): IUploadHandler => {
  return async (file) => {
    const processImage = (image: any) => {
      const img = new Image();
      img.src = image;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;

        const res = 256; // The largest we want the thumbnail to be is 256 x 256
        const newWidth = Math.sqrt(res * res * aspectRatio);
        const newHeight = Math.sqrt((res * res) / aspectRatio);
        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        const dataUrl = canvas.toDataURL();

        setImage(dataUrl);
      };
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      processImage(reader.result);
    };
    reader.readAsDataURL(file);
    return Promise.resolve();
  };
};

/**
 * Delete the image if one exists
 * @param image Image to delete
 * @param setImage State function to set the image
 */
const deleteImage = (image, setImage) => {
  if (image) setImage('');
};

/**
 * Thumbnail image component
 * @param image Image to delete
 * @param setImage State function to set the image
 */
const ThumbnailImage = ({ image, setImage }) => {
  return (
    <div>
      <button
        style={uploadImageStyles.thumbnailDelete}
        className="delete-image-button"
        title="Delete Image"
        onClick={() => {
          deleteImage(image, setImage);
        }}>
        X
      </button>
      <img style={uploadImageStyles.thumbnail} src={image} alt="Project" />
    </div>
  );
};

/**
 * Create project - General information section
 *
 * @return {*}
 */

const ProjectGeneralInformationForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  // const { values, setFieldValue, setFieldError } = formikProps;
  // console.log('values', values);

  const [image, setImage] = useState('' as any);

  return (
    <Grid container spacing={3}>
      <div style={uploadImageStyles.general}>
        <div style={uploadImageStyles.description}>Project Image</div>
        {image ? (
          <ThumbnailImage image={image} setImage={setImage} />
        ) : (
          <FileUpload
            uploadHandler={uploadImage(setImage)}
            dropZoneProps={{
              maxFileSize: 10 * 1024 * 1024, // 10MB
              maxNumFiles: 1,
              multiple: false,
              acceptedFileExtensionsHumanReadable: 'PNG & JPG',
              acceptedFileExtensions: {
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg']
              }
            }}
          />
        )}
      </div>
      <Grid item xs={12} md={8}>
        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <CustomTextField
              name="project.project_name"
              label="Project Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="project.no_data"
              label="Project Status"
              other={{
                InputProps: {
                  readOnly: true,
                  startAdornment: (
                    <Chip
                      size="small"
                      sx={getStatusStyle(getStateCodeFromLabel(states.DRAFT))}
                      label={states.DRAFT}
                    />
                  )
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid item xs={12}>
              <CustomTextField
                name="project.brief_desc"
                label="Brief Description"
                other={{ required: true, multiline: true, maxRows: 5 }}
                maxLength={500}
              />
            </Grid>
          </Grid>
          <ProjectStartEndDateFields
            formikProps={formikProps}
            plannedStartName={'project.start_date'}
            plannedEndName={'project.end_date'}
            plannedStartRequired={false}
            plannedEndRequired={false}
            actualStartName={'project.actual_start_date'}
            actualEndName={'project.actual_end_date'}
            actualStartRequired={false}
            actualEndRequired={false}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectGeneralInformationForm;
