import { mdiMenuDown } from '@mdi/js';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Icon } from '@mdi/react';
import { checkCodeType, CodeSet, CodeType, CombinedCode } from 'interfaces/useCodesApi.interface';
import React from 'react';

export interface ICodeTableProps {
  title: string;
  type: CodeType;
  data: CodeSet<CombinedCode>;
  handleOpen: (row: CombinedCode, type: CodeType) => void;
}

/**
 * Displays the code Table.
 *
 * @return {*}
 */
const CodeTable: React.FC<ICodeTableProps> = (props) => {
  const { title, type, data, handleOpen } = props;

  return (
    <TableContainer component={Paper}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<Icon path={mdiMenuDown} size={1} aria-label="Expand" />}
          aria-controls={`${title}-content`}
          id={`${title}-header`}>
          <Typography variant="h2" p={2}>
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table aria-labelledby={`${title}-header`}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{checkCodeType(row)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpen(row, type)}
                      aria-label={`Edit ${row.name}`}>
                      Edit
                    </Button>
                    {/* <Button variant="contained" color="secondary">
                      Delete
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </TableContainer>
  );
};

export default CodeTable;
