import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';

const pageStyles = {
  dropZoneTitle: {
    marginBottom: '1rem',
    fontSize: '1.125rem',
    fontWeight: 700
  },
  dropZoneIcon: {
    color: 'gray'
  },
  dropZoneRequirements: {
    textAlign: 'center'
  }
};

const BYTES_PER_MEGABYTE = 1048576;

export interface IDropZoneProps {
  /**
   * Function called when files are accepted/rejected (via either drag/drop or browsing).
   *
   * Note: Files may be rejected due of file size limits or file number limits
   *
   * @memberof IDropZoneProps
   */
  onFiles: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
}

export interface IDropZoneConfigProps {
  /**
   * Maximum file size allowed (in bytes).
   *
   * @type {number}
   * @memberof IDropZoneProps
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed.
   *
   * @type {number}
   * @memberof IDropZoneProps
   */
  maxNumFiles?: number;
  /**
   * Allow selecting multiple files while browsing.
   * Default: true
   *
   * Note: Does not impact drag/drop.
   *
   * @type {boolean}
   * @memberof IDropZoneProps
   */
  multiple?: boolean;
  /**
   * Comma separated list of allowed file extensions.
   *
   * Example: `'.pdf, .txt'`
   *
   * @type {string}
   * @memberof IDropZoneConfigProps
   */
  acceptedFileExtensions?: { [key: string]: string[] };
}

export const DropZone: React.FC<IDropZoneProps & IDropZoneConfigProps> = (props) => {
  const config = useContext(ConfigContext);

  const maxNumFiles = props.maxNumFiles || config?.MAX_UPLOAD_NUM_FILES;
  const maxFileSize = props.maxFileSize || config?.MAX_UPLOAD_FILE_SIZE;
  const multiple = props.multiple ?? true;

  return (
    <Box className="dropZoneContainer">
      <Dropzone
        maxFiles={maxNumFiles}
        maxSize={maxFileSize}
        multiple={multiple}
        onDrop={props.onFiles}
        accept={props.acceptedFileExtensions}>
        {({ getRootProps, getInputProps }) => (
          <Box {...getRootProps()}>
            <input {...getInputProps()} data-testid="drop-zone-input" />
            <Box p={2} display="flex" flexDirection="column" alignItems="center">
              <Icon color={pageStyles.dropZoneIcon.color} path={mdiTrayArrowUp} size={1.5} />
              <Box mt={0.5} sx={pageStyles.dropZoneTitle}>
                Drag your {(multiple && 'files') || 'file'} here, or{' '}
                <Link underline="always">Browse Files</Link>
              </Box>
              <Box textAlign="center">
                <Box>
                  <Typography component="span" variant="subtitle2" color="textSecondary">
                    {`Accepted files: GeoJSON`}
                  </Typography>
                </Box>
                {!!maxFileSize && maxFileSize !== Infinity && (
                  <Box>
                    <Typography component="span" variant="subtitle2" color="textSecondary">
                      {`Maximum file size: ${Math.round(maxFileSize / BYTES_PER_MEGABYTE)} MB`}
                    </Typography>
                  </Box>
                )}
                {!!maxNumFiles && (
                  <Box>
                    <Typography component="span" variant="subtitle2" color="textSecondary">
                      {`Maximum files: ${maxNumFiles}`}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Dropzone>
    </Box>
  );
};

export default DropZone;
