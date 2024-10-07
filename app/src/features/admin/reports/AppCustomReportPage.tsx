import React, { useState } from 'react';
import { useNertApi } from 'hooks/useNertApi';
import { Box, Container, Typography, Stack, Breadcrumbs, Link, Button } from '@mui/material';
import { ArrowBack, FileDownload } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';
import { CustomReportI18N } from 'constants/i18n';
import { IGetCustomReportData } from 'interfaces/useAdminApi.interface';
import dayjs from 'dayjs';
import { DATE_FORMAT } from 'constants/dateTimeFormats';

const pageStyles = {
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  },
  roleChip: {
    backgroundColor: '#4371C5',
    color: '#ffffff'
  },
  project: {
    backgroundColor: '#E9FBFF'
  },
  plan: {
    backgroundColor: '#FFF4EB'
  }
};
/**
 * Page to display Application report.
 *
 * @return {*}
 */
const AppCustomReportPage: React.FC = () => {
  const restorationTrackerApi = useNertApi();
  const history = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [customReportData, setCustomReportData] = useState<IGetCustomReportData[]>([]);
  const location = useLocation();
  const { startDate, endDate } = location.state;

  const getCustomReportData = async () => {
    const data = await restorationTrackerApi.admin.getCustomReport(startDate, endDate);
    setIsLoading(false);
    setCustomReportData(data);
  };

  if (isLoading) {
    getCustomReportData();
    return;
  }

  const handleCancel = () => {
    history('/admin/reports');
  };

  const csvDownload = () => {
    console.log('***customReportData', customReportData);
    // Convert the data array into a CSV string
    const csvString = [
      [
        'ID',
        'IS_PROJECT',
        'NAME',
        'OBJECTIVE',
        'BRIEF_DESC',
        'START_DATE',
        'END_DATE',
        'ACTUAL_START_DATE',
        'ACTUAL_END_DATE',
        'STATUS_CODE',
        'PEOPLE_INVOLVED',
        'HEALING_LAND',
        'HEALING_PEOPLE',
        'CULTURAL_INITIATIVE',
        'LAND_INITIATIVE',
        'PROJECT_PART_PUBLIC_PLAN',
        'CREATE_DATE',
        'CREATE_USER_NAME',
        'UPDATE_DATE',
        'UPDATE_USER_NAME',
        'CONTACTS'
      ],
      ...customReportData.map((item) => {
        return [
          item.id,
          item.is_project,
          `"${item.name}"`,
          '"[' +
            item.objective
              .map((obj) => {
                return `""${obj}""`;
              })
              .join(',') +
            ']"',
          `"${item.brief_desc}"`,
          item.start_date,
          item.end_date,
          item.actual_start_date,
          item.actual_end_date,
          item.state_code,
          item.people_involved,
          item.is_healing_land,
          item.is_healing_people,
          item.is_cultural_initiative,
          item.is_land_initiative,
          item.is_project_part_public_plan,
          `"${dayjs(item.create_date).format(DATE_FORMAT.ShortDateTimeFormat)}"`,
          `"${item.create_user_name}"`,
          `"${dayjs(item.update_date).format(DATE_FORMAT.ShortDateTimeFormat)}"`,
          `"${item.update_user_name}"`,
          '"[' +
            item.contacts
              .map((contact) => {
                const contactMap = new Map(Object.entries(contact));
                let idx = 0;
                let contactObj = '{';
                let lastItem = ',';
                contactMap.forEach((value: any, key) => {
                  idx = ++idx;
                  if ('project_id' === key) return;
                  if (contactMap.size === idx) lastItem = '';
                  if ('boolean' === typeof value) {
                    contactObj = contactObj.concat(`""${key}"":${value}${lastItem}`);
                    return;
                  }
                  contactObj = contactObj.concat(`""${key}"":""${value}""${lastItem}`);
                });
                return contactObj;
              })
              .join('},') +
            '}]"'
        ];
      })
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv' });

    // Generate a download link and initiate the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const day = dayjs().format(DATE_FORMAT.ShortDateFormat);
    link.download = `restoration_tracker_data_${day}.csv` || 'download.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl">
      <Box mt={1}>
        <Breadcrumbs>
          <Link
            color="primary"
            onClick={handleCancel}
            aria-current="page"
            sx={pageStyles.breadCrumbLink}>
            <ArrowBack color="primary" fontSize="small" sx={pageStyles.breadCrumbLinkIcon} />
            <Typography variant="body2">Cancel and Exit</Typography>
          </Link>
        </Breadcrumbs>
      </Box>

      <Box my={2}>
        <Stack direction="column">
          <Typography variant="h1">Custom Report</Typography>
          <Stack direction="row" spacing={1}>
            <Typography variant="h3">from:</Typography>
            <Typography variant="h3" color="gray">
              {startDate}
            </Typography>
            <Typography variant="h3">to:</Typography>
            <Typography variant="h3" color="gray">
              {endDate}
            </Typography>
          </Stack>
        </Stack>
        <Button
          sx={{ mt: 2 }}
          color="primary"
          variant="contained"
          size="large"
          onClick={csvDownload}
          data-testid="csv-report-download-button"
          aria-label={CustomReportI18N.downloadCsvFile}
          startIcon={<FileDownload />}>
          <span>{CustomReportI18N.downloadCsvFile}</span>
        </Button>
      </Box>
    </Container>
  );
};

export default AppCustomReportPage;
