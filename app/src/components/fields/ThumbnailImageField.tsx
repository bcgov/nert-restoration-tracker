import { IUploadHandler } from 'components/attachments/FileUploadItem';
import { useFormikContext } from 'formik';
import { IProjectGeneralInformationForm } from 'features/projects/components/ProjectGeneralInformationForm';
import React, { useContext, useEffect, useState } from 'react';
import { ConfigContext } from 'contexts/configContext';
import FileUpload from 'components/attachments/FileUpload';
import ThumbnailImageCard from 'components/attachments/ThumbnailImageCard';

// Fixing a lame typescript error
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

  const [image, setImage] = useState<string>('');

  const deleteImage = () => {
    setFieldValue('project.project_image', null);
    setFieldValue('project.image_url', null);
    setImage('');
  };

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

      setImage(dataUrl);
    };
  };

  const handleLoadImage = (file: File) => {
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

  const uploadImage = (): IUploadHandler => {
    return async (file: File) => {
      setFieldValue('project.project_image', file);
      handleLoadImage(file);
    };
  };

  useEffect(() => {
    if (values.project.image_url) {
      setImage(values.project.image_url);
    }
  }, [values.project.image_url]);

  return (
    <div style={uploadImageStyles.general}>
      <div style={uploadImageStyles.description}>Thumbnail Image</div>
      {image ? (
        <ThumbnailImageCard image={image} deleteImage={deleteImage} />
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

export default ThumbnailImageField;
