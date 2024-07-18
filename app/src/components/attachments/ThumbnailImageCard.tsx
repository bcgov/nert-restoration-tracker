import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import React from 'react';

const positionAbsolute = 'absolute' as const;

const uploadImageStyles = {
  thumbnail: {
    borderRadius: '25px',
    maxHeight: '256px',
    height: 'auto'
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

export interface IThumbnailImageCard {
  image: string;
  deleteImage?: () => void;
}

const ThumbnailImageCard: React.FC<IThumbnailImageCard> = (props) => {
  const { image, deleteImage } = props;

  return (
    <Card sx={uploadImageStyles.thumbnail}>
      <CardMedia component="img" image={image} alt="Thumbnail Image" />
      <CardActions sx={uploadImageStyles.thumbnailAction}>
        {
          // Delete Image Button
          deleteImage && (
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
          )
        }
      </CardActions>
    </Card>
  );
};

export default ThumbnailImageCard;
