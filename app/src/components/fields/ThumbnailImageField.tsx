import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import { useFormikContext } from 'formik';
import { IProjectGeneralInformationForm } from 'features/projects/components/ProjectGeneralInformationForm';
import React, { useContext } from 'react';
import { ConfigContext } from 'contexts/configContext';
import FileUpload from 'components/attachments/FileUpload';

// Fixing a lame typescript error
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
    borderRadius: '25px'
  },
  thumbnailAction: {
    position: positionAbsolute,
    top: '12px',
    right: '-10px'
  },
  thumbnailDelete: {
    color: 'white',
    transition: 'all ease-out 0.2s',
    opacity: 0.7,
    fontSize: '2.0rem'
  }
};

/**
 * Create project - General information section
 *
 * @return {*}
 */
const ThumbnailImageField: React.FC = () => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();
  const { values, setFieldValue } = formikProps;

  const config = useContext(ConfigContext);

  const deleteImage = () => {
    setFieldValue('project.project_image', '');
  };

  const uploadImage = (): IUploadHandler => {
    return async (file) => {
      const processImage = (image: string) => {
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

          setFieldValue('project.project_image', dataUrl);
        };
      };

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') {
          return Promise.reject('Failed to read image');
        }

        processImage(reader.result);
      };
      reader.readAsDataURL(file);
      return Promise.resolve();
    };
  };

  return (
    <div style={uploadImageStyles.general}>
      <div style={uploadImageStyles.description}>Project Image</div>
      {values.project.project_image ? (
        <ThumbnailImageCard image={values.project.project_image} deleteImage={deleteImage} />
      ) : (
        <FileUpload
          uploadHandler={uploadImage()}
          dropZoneProps={{
            maxFileSize: config?.MAX_IMAGE_UPLOAD_SIZE || 52428800,
            maxNumFiles: config?.MAX_IMAGE_NUM_FILES || 1,
            multiple: config?.ALLOW_MULTIPLE_IMAGE_UPLOADS || false,
            acceptedFileExtensionsHumanReadable: 'PNG & JPG',
            acceptedFileExtensions: {
              'image/png': ['.png'],
              'image/jpeg': ['.jpg', '.jpeg']
            }
          }}
        />
      )}
    </div>
  );
};

export interface IThumbnailImageCard {
  image: string;
  deleteImage: () => void;
}

export const ThumbnailImageCard: React.FC<IThumbnailImageCard> = (props) => {
  const { image, deleteImage } = props;

  return (
    <Card sx={uploadImageStyles.thumbnail}>
      <CardMedia component="img" height="200" image={image} alt="Thumbnail Image" />
      <CardActions sx={uploadImageStyles.thumbnailAction}>
        <IconButton
          title="Delete Image"
          onClick={() => {
            deleteImage();
          }}>
          <DeleteForeverOutlinedIcon
            className="delete-image-button"
            sx={uploadImageStyles.thumbnailDelete}
          />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ThumbnailImageField;
