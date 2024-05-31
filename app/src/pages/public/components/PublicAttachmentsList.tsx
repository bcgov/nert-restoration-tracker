import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedFileSize } from 'utils/Utils';

const pageStyles = {
  attachmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  }
};

export interface IPublicAttachmentsListProps {
  projectId: number;
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

const PublicAttachmentsList: React.FC<IPublicAttachmentsListProps> = (props) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const openAttachment = async (attachment: IGetProjectAttachment) => window.open(attachment.url);

  return (
    <>
      <TableContainer>
        <Table sx={pageStyles.attachmentsTable} aria-label="attachments-list-table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>File Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.attachmentsList.length > 0 &&
              props.attachmentsList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={`${row.fileName}-${index}`}>
                    <TableCell scope="row">
                      <Link
                        underline="always"
                        component="button"
                        variant="body2"
                        onClick={() => openAttachment(row)}>
                        {row.fileName}
                      </Link>
                    </TableCell>
                    <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                  </TableRow>
                ))}
            {!props.attachmentsList.length && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Attachments
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {props.attachmentsList.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20]}
          component="div"
          count={props.attachmentsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event: unknown, newPage: number) =>
            handleChangePage(event, newPage, setPage)
          }
          onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChangeRowsPerPage(event, setPage, setRowsPerPage)
          }
        />
      )}
    </>
  );
};

export default PublicAttachmentsList;
