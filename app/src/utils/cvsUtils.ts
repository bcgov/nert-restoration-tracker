import { IGetCustomReportData } from 'interfaces/useAdminApi.interface';
import dayjs from 'dayjs';
import { DATE_FORMAT } from 'constants/dateTimeFormats';

const cvsHeader = [
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
  'CONTACTS',
  'ATTACHMENTS',
  'FUNDING_SOURCES',
  'CONSERVATION_AREAS',
  'NRM_REGION',
  'SPATIAL_TYPE',
  'OVERLAPS_CONSERVATION_AREA',
  'NUMBER_SITES',
  'SIZE_HA',
  'SPATIAL_CREATE_DATE',
  'AUTHORIZATIONS',
  'PARTNERSHIPS',
  'SPECIES'
];

function processObject(data: string[]) {
  return (
    '"[' +
    data
      .map((dataItem) => {
        const objMap = new Map(Object.entries(dataItem));
        let idx = 0;
        let itemObj = '{';
        let lastItem = ',';
        objMap.forEach((value: any, key) => {
          idx = ++idx;
          if ('project_id' === key) return;
          if (objMap.size === idx) lastItem = '';
          if ('boolean' === typeof value || 'number' === typeof value) {
            itemObj = itemObj.concat(`""${key}"":${value}${lastItem}`);
            return;
          }
          itemObj = itemObj.concat(`""${key}"":""${value}""${lastItem}`);
        });
        return itemObj;
      })
      .join('},') +
    '}]"'
  );
}

export const csvDownload = async (
  data: IGetCustomReportData[],
  fromDate: string,
  toDate: string
) => {
  // Convert the data array into a CSV string
  const csvString = [
    cvsHeader,
    ...data.map((item) => {
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
        item.contacts[0] ? processObject(item.contacts) : '"[]"',
        item.attachments[0] ? processObject(item.attachments) : '"[]"',
        item.funding_sources[0] ? processObject(item.funding_sources) : '"[]"',
        item.conservation_areas[0] ? processObject(item.conservation_areas) : '"[]"',
        item.mgmt_region_id,
        item.spatial_type_name,
        item.overlaps_conservation_area,
        item.number_sites,
        item.size_ha,
        `"${dayjs(item.spatial_create_date).format(DATE_FORMAT.ShortDateTimeFormat)}"`,
        item.authorizations[0] ? processObject(item.authorizations) : '"[]"',
        item.partnerships[0] ? processObject(item.partnerships) : '"[]"',
        item.species[0] ? processObject(item.species) : '"[]"'
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
  link.download =
    `restoration_tracker_data_created${day}_from${fromDate}_to${toDate}.csv` || 'download.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
