import React from 'react';
import { Box, Card, CardMedia, Divider, Link, Stack, Typography } from '@mui/material';
import { ICONS } from 'constants/misc';
import { useNavigate } from 'react-router-dom';
interface IDashboardCardProps {
  type: number;
  showLast: boolean;
  label1: string;
  label2: string;
  label3: string;
  label1Value: number;
  label2Value: number;
  label3Value: number;
  value1Name?: string;
  value2Datetime?: string | null;
  value3Id?: number;
  value4Name?: string;
  value5Datetime?: string | null;
  value6Id?: number;
  dividerLabel1?: string;
  dividerLabel2?: string;
  dividerLabel3?: string;
}

interface ITypeItem {
  typeLabel: string;
  typeIcon: any;
  typeStyle: object;
}

const pageStyles = {
  cardProjectStyle: {
    minWidth: 250,
    borderRadius: '20px',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
    transition: '0.3s',
    backgroundColor: '#E9FBFF'
  },
  cardPlanStyle: {
    minWidth: 250,
    borderRadius: '20px',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
    transition: '0.3s',
    backgroundColor: '#FFF4EB'
  },
  cardUserStyle: {
    minWidth: 250,
    borderRadius: '20px',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
    transition: '0.3s',
    backgroundColor: '#E2DDFB'
  },
  cardTitleText: {
    textTransform: 'uppercase',
    fontSize: 14,
    color: 'grey.600',
    letterSpacing: '1px'
  },
  cardBodyText: {
    fontSize: 14,
    color: 'grey.500'
  },
  cardDateTimeText: {
    fontSize: 12,
    color: 'grey.500'
  },
  cardBodyNumber: {
    fontSize: 14,
    color: 'grey.500',
    fontWeight: 600,
    ml: 1.5
  },
  cardBoxRow: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 1,
    mx: 2,
    mb: 1
  },
  cardBoxColumn: {
    display: 'flex',
    alignItems: 'flex-end',
    flexDirection: 'column',
    mx: 2
  },
  iconSize: {
    width: 20,
    height: 32
  }
};

/**
 * Function to render dashboard card
 *
 * @param {*} props
 * @return {*}
 */
function DashboardCard(props: IDashboardCardProps) {
  const {
    type,
    showLast,
    label1,
    label2,
    label3,
    label1Value,
    label2Value,
    label3Value,
    value1Name,
    value2Datetime,
    value3Id,
    value4Name,
    value5Datetime,
    value6Id,
    dividerLabel1,
    dividerLabel2,
    dividerLabel3
  } = props;
  const history = useNavigate();
  const TypeCard = {
    PROJECT: 1,
    PLAN: 2,
    USERS: 4
  };

  const item: ITypeItem =
    (type & TypeCard.PROJECT) !== 0
      ? {
          typeLabel: 'Projects',
          typeIcon: ICONS.PROJECT_ICON,
          typeStyle: pageStyles.cardProjectStyle
        }
      : (type & TypeCard.PLAN) !== 0
        ? { typeLabel: 'Plans', typeIcon: ICONS.PLAN_ICON, typeStyle: pageStyles.cardPlanStyle }
        : { typeLabel: 'Users', typeIcon: ICONS.USER_ICON, typeStyle: pageStyles.cardUserStyle };

  return (
    <Card sx={item.typeStyle}>
      <Box sx={pageStyles.cardBoxRow}>
        <CardMedia sx={pageStyles.iconSize} image={item.typeIcon} title={item.typeLabel} />
        <Typography sx={pageStyles.cardTitleText}>{item.typeLabel}</Typography>
      </Box>
      <Divider sx={pageStyles.cardBodyText} textAlign="left">
        {dividerLabel1}
      </Divider>
      <Box sx={pageStyles.cardBoxColumn}>
        <Stack direction="row">
          <Typography sx={pageStyles.cardBodyText}>{label1}</Typography>
          <Typography sx={pageStyles.cardBodyNumber}>{label1Value}</Typography>
        </Stack>
        <Stack direction="row">
          <Typography sx={pageStyles.cardBodyText}>{label2}</Typography>
          <Typography sx={pageStyles.cardBodyNumber}>{label2Value}</Typography>
        </Stack>
        <Stack direction="row">
          <Typography sx={pageStyles.cardBodyText}>{label3}</Typography>
          <Typography sx={pageStyles.cardBodyNumber}>{label3Value}</Typography>
        </Stack>
      </Box>

      {showLast && (
        <>
          <Divider sx={pageStyles.cardBodyText} textAlign="left">
            {dividerLabel2}
          </Divider>
          <Box sx={pageStyles.cardBoxColumn}>
            <Stack direction="column">
              <Link
                underline="always"
                component="button"
                sx={{ textAlign: 'left' }}
                variant="body2"
                onClick={
                  1 == type
                    ? () => history(`/admin/projects/${value3Id}/details`)
                    : () => history(`/admin/plans/${value3Id}/details`)
                }>
                {value1Name}
              </Link>
              <Typography sx={pageStyles.cardDateTimeText}>{value2Datetime}</Typography>
            </Stack>
          </Box>
          <Divider sx={pageStyles.cardBodyText} textAlign="left">
            {dividerLabel3}
          </Divider>
          <Box sx={pageStyles.cardBoxColumn}>
            <Stack direction="column">
              <Link
                underline="always"
                component="button"
                sx={{ textAlign: 'left' }}
                variant="body2"
                onClick={
                  2 === type
                    ? () => history(`/admin/plans/${value6Id}/details`)
                    : () => history(`/admin/projects/${value6Id}/details`)
                }>
                {value4Name}
              </Link>

              <Typography sx={pageStyles.cardDateTimeText}>{value5Datetime}</Typography>
            </Stack>
          </Box>
        </>
      )}
    </Card>
  );
}

export default DashboardCard;
