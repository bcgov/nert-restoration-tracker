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

  const processImage = (image: string, file: File) => {
    const img = new Image();
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;

      const res = 512; // The largest we want the thumbnail to be is 256 x 256
      const newWidth = Math.sqrt(res * res * aspectRatio);
      const newHeight = Math.sqrt((res * res) / aspectRatio);
      canvas.width = newWidth;
      canvas.height = newHeight;

      if (ctx && ctx.imageSmoothingEnabled) ctx.imageSmoothingEnabled = true;
      if (ctx && ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = 'high';

      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      // Add the image to the form
      const dataUrl = canvas.toDataURL();
      setImage(dataUrl);

      // Convert back to a file object and store in formick
      canvas.toBlob((blob) => {
        const thumbnailFile = new File([blob as Blob], file.name, { type: file.type });
        setFieldValue('project.project_image', thumbnailFile);
      });

    };
  };

  const handleLoadImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return Promise.reject('Failed to read image');
      }

      processImage(reader.result, file);
    };
    reader.readAsDataURL(file);
    return Promise.resolve();
  };

  const uploadImage = (): IUploadHandler => {
    return async (file: File) => {
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
