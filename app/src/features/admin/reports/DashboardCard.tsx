import React from 'react';
import { Box, Card, CardMedia, Divider, Stack, Typography } from '@mui/material';
import { ICONS } from 'constants/misc';

interface IDashboardCardProps {
  type: number;
  label1: string;
  label1Value: number;
  label2: string;
  label2Value: number;
  label3: string;
  label3Value: number;
}

interface ITypeItem {
  typeLabel: string;
  typeIcon: any;
  typeStyle: object;
}

const pageStyles = {
  cardProjectStyle: {
    minWidth: 200,
    borderRadius: '20px',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
    transition: '0.3s',
    backgroundColor: '#E9FBFF'
  },
  cardPlanStyle: {
    minWidth: 200,
    borderRadius: '20px',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
    transition: '0.3s',
    backgroundColor: '#FFF4EB'
  },
  cardUserStyle: {
    minWidth: 200,
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
    color: 'grey.500',
    letterSpacing: '1px'
  },
  cardBodyNumber: {
    fontSize: 14,
    color: 'grey.500',
    letterSpacing: '1px',
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
  const { type, label1, label1Value, label2, label2Value, label3, label3Value } = props;
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
      <Divider />
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
    </Card>
  );
}

export default DashboardCard;
