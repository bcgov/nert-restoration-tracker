import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useCodesContext } from 'hooks/useContext';
import React from 'react';
import CodeTable from './CodeTable';
import CodeDialog from './CodeDialog';
import { CodeType, CombinedCode } from 'interfaces/useCodesApi.interface';
import { useNertApi } from 'hooks/useNertApi';

/**
 * Displays the codes page.
 *
 * @return {*}
 */
const CodesPage: React.FC = () => {
  const api = useNertApi();
  const codes = useCodesContext();

  const [open, setOpen] = React.useState(false);
  const [selectedCode, setSelectedCode] = React.useState<CombinedCode | null>(null);
  const [type, setType] = React.useState<CodeType>();

  const handleOpen = (row: CombinedCode, type: CodeType) => {
    setSelectedCode(row);
    setType(type);
    setOpen(true);
  };

  const handleUpdate = async (codeType: CodeType, codeData: CombinedCode) => {
    await api.codes.updateCode(codeType, codeData);
    codes.codesDataLoader.refresh();
    setOpen(false);
  };

  if (!codes.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Container maxWidth="xl">
      <CodeDialog
        open={open}
        onClose={() => setOpen(false)}
        handleUpdate={handleUpdate}
        codeSet={selectedCode}
        title={`Edit ${type} Code`}
        type={type}
      />

      <Box my={2}>
        <Typography variant="h1">Codes Dashboard</Typography>
      </Box>

      <CodeTable
        title="Branding Codes"
        type={CodeType.BRANDING}
        data={codes.codesDataLoader.data?.branding}
        handleOpen={handleOpen}
      />
    </Container>
  );
};

export default CodesPage;
