/**
 * @file ImageUpload.tsx
 * @description A component that allows users to upload images.
 * Area that a user can drag and drop a png or jpg file to upload.
 */

import React, { useState } from 'react';

const ImageUpload = () => {
  const [hoverText, setHoverText] = useState('Upload Image');

  const [image, setImage] = useState('' as any);

  const handleMouseEnter = () => {
    setHoverText('Click or drag and drop an image here');
  };
  const handleMouseLeave = () => {
    setHoverText('Upload Image');
  };

  /**
   * Handle drag over event. This is used for reporting only.
   * @param e Mouse event
   */
  const handleDragOver = (e: any) => {
    e.preventDefault();
    const files = e.dataTransfer.items;
    if (files.length) {
      const fileType = files[0].type;
      if (fileType === 'image/png' || fileType === 'image/jpeg') {
        setHoverText('Drop Image');
      } else {
        setHoverText('Only PNG and JPEG files are allowed!');
      }
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    const processImage = (image: any) => {
      console.log('originalLength', image.length);
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
        console.log('newLength', dataUrl.length);
      };
    };

    if (files.length) {
      if (files[0].type === 'image/png' || files[0].type === 'image/jpeg') {
        const reader = new FileReader();
        reader.onloadend = () => {
          processImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
        setHoverText('Yum yum yum!');
      } else {
        setHoverText('Not a supported file format!');
      }
    }
  };
  // Fixing a lame typescript error
  const centerText = 'center' as const;
  const fitObject = 'cover' as const;

  // Styles for the component
  const styles = {
    default: {
      border: '3px dashed #0003',
      height: '200px',
      width: '200px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '25px',
      cursor: 'pointer',
      overflow: 'hidden'
    },
    text: {
      color: '#0003',
      fontSize: '1.2rem',
      margin: '1rem',
      textAlign: centerText
    },
    image: {
      height: '200px',
      width: '100%',
      objectFit: fitObject
    }
  };

  return (
    <div
      style={styles.default}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleMouseLeave}
      onDrop={handleDrop}>
      {image ? (
        <img src={image} alt="uploaded" style={styles.image} />
      ) : (
        <div style={styles.text}>{hoverText}</div>
      )}
    </div>
  );
};

export default ImageUpload;
