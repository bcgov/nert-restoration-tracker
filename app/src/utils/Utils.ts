import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { DATE_FORMAT, TIME_FORMAT } from 'constants/dateTimeFormats';
import { focusOptions } from 'constants/misc';
import { IConfig } from 'contexts/configContext';
import dayjs from 'dayjs';
import { IGetProjectForViewResponseDetails } from 'interfaces/useProjectApi.interface';

/**
 * Checks if a url string starts with an `http[s]://` protocol, and adds `https://` if it does not. If the url
 * begins with `localhost` or `host.docker.internal`, the `http` protocol is used.
 *
 * @param {string} url
 * @param {('http://' | 'https://')} [protocol='https://'] The protocol to add, if necessary. Defaults to `https://`.
 * @return {*}  {string} the url which is guaranteed to have an `http(s)://` protocol.
 */
export const ensureProtocol = (
  url: string,
  protocol: 'http://' | 'https://' = 'https://'
): string => {
  if (url.startsWith('localhost') || url.startsWith('host.docker.internal')) {
    return `${'http://'}${url}`;
  }

  if (
    url.startsWith('https://') ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://host.docker.internal')
  ) {
    return url;
  }

  if (url.startsWith('http://')) {
    // If protocol is HTTPS, upgrade the URL
    if (protocol === 'https://') {
      return `${'https://'}${url.slice(7)}`;
    }
  }

  return `${protocol}${url}`;
};

/**
 * Builds a URL from multiple (possibly null or undefined) url parts, stripping any
 * double slashes from the resulting URL.
 *
 * @param {(string | undefined)[]} urlParts The parts of the URL
 * @returns The built URL
 */
export const buildUrl = (...urlParts: (string | undefined)[]): string => {
  return urlParts
    .filter((urlPart): urlPart is string => Boolean(urlPart))
    .map((urlPart) => String(urlPart).trim()) // Trim leading and trailing whitespace
    .filter(Boolean)
    .join('/')
    .replace(/([^:]\/)\/+/g, '$1'); // Trim double slashes
};
/**
 * Formats a date range into a formatted string.
 *
 * @param {DATE_FORMAT} dateFormat
 * @param {string} startDate ISO 8601 date string
 * @param {string} [endDate] ISO 8601 date string
 * @param {string} [dateSeparator='-'] specify date range separator
 * @return {string} formatted date string, or an empty string if unable to parse the startDate and/or endDate
 */
export const getFormattedDateRangeString = (
  dateFormat: DATE_FORMAT,
  startDate: string,
  endDate?: string,
  dateSeparator = '-'
): string => {
  const startDateFormatted = getFormattedDate(dateFormat, startDate);

  const endDateFormatted = getFormattedDate(dateFormat, endDate || '');

  if (!startDateFormatted || (endDate && !endDateFormatted)) {
    return '';
  }

  if (endDateFormatted) {
    return `${startDateFormatted} ${dateSeparator} ${endDateFormatted}`;
  }

  return startDateFormatted;
};

/**
 * Get a formatted date string.
 *
 * @param {DATE_FORMAT} dateFormat
 * @param {string} date ISO 8601 date string
 * @return {string} formatted date string, or an empty string if unable to parse the date
 */
export const getFormattedDate = (dateFormat: DATE_FORMAT, date: string): string => {
  const dateMoment = dayjs(date);

  if (!dateMoment.isValid()) {
    //date was invalid
    return '';
  }

  return dateMoment.format(dateFormat);
};

/**
 * Get the difference in months between 2 dates.
 *
 * @param {string} startDate ISO 8601 date string
 * @param {string} endDate ISO 8601 date string
 * @return {number} 0 if start date is after end date, otherwise number of months
 */
export const getDateDiffInMonths = (startDate: string, endDate: string): number => {
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);

  if (d2 <= d1) return 0;

  return Math.max((d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth(), 0);
};

/**
 * Get a formatted time string.
 *
 * @param {TIME_FORMAT} timeFormat
 * @param {string} date ISO 8601 date string
 * @return {string} formatted time string, or an empty string if unable to parse the date
 */
export const getFormattedTime = (timeFormat: TIME_FORMAT, date: string): string => {
  const dateMoment = dayjs(date);

  if (!dateMoment.isValid()) {
    //date was invalid
    return '';
  }

  return dateMoment.format(timeFormat);
};

/**
 * Get a formatted amount string.
 *
 * @param {number} amount
 * @return {string} formatted amount string (rounded to the nearest integer), or an empty string if unable to parse the amount
 */
export const getFormattedAmount = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  if (!amount && amount !== 0) {
    //amount was invalid
    return '';
  }
  return formatter.format(amount);
};

/**
 * Returns a url that when navigated to, will log the user out, redirecting them to the login page.
 *
 * @param {IConfig} config
 * @return {*}  {(string | undefined)}
 */
export const getLogOutUrl = (config: IConfig): string | undefined => {
  if (
    !config ||
    !config.KEYCLOAK_CONFIG?.url ||
    !config.KEYCLOAK_CONFIG?.realm ||
    !config.SITEMINDER_LOGOUT_URL
  ) {
    return;
  }

  const localRedirectURL = `${window.location.origin}/`;

  const keycloakLogoutRedirectURL = `${config.KEYCLOAK_CONFIG.url}/realms/${config.KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout?redirect_uri=${localRedirectURL}`;

  return `${config.SITEMINDER_LOGOUT_URL}?returl=${keycloakLogoutRedirectURL}&retnow=1`;
};

export const getFormattedFileSize = (fileSize: number) => {
  if (!fileSize) {
    return '0 KB';
  }

  // kilobyte size
  if (fileSize < 1000000) {
    return `${(fileSize / 1000).toFixed(1)} KB`;
  }

  // megabyte size
  if (fileSize < 1000000000) {
    return `${(fileSize / 1000000).toFixed(1)} MB`;
  }

  // gigabyte size
  return `${(fileSize / 1000000000).toFixed(1)} GB`;
};

/**
 * Temporarily adds and clicks an anchor tag in order to trigger the browser file download.
 *
 * @param {string} fileData
 * @param {string} fileName
 */
export const triggerFileDownload = (fileData: string, fileName: string) => {
  // add anchor tag to page
  const a = document.createElement('a');
  document.body.appendChild(a);

  // set anchor link
  const url = window.URL.createObjectURL(new Blob([fileData]));
  a.href = url;
  a.download = fileName;

  // click anchor tag to trigger browser file download
  a.click();

  // clean up
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 0);
};

/**
 * Returns a human-readible identity source string.
 *
 * @example getFormattedIdentitySource("BCEIDBUSINESS"); // => "BCeID Business"
 *
 * @param {SYSTEM_IDENTITY_SOURCE} identitySource The identity source
 * @returns {*} {string} the string representing the identity source
 */
export const getFormattedIdentitySource = (
  identitySource: SYSTEM_IDENTITY_SOURCE
): string | null => {
  switch (identitySource) {
    case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
      return 'BCeID Basic';

    case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
      return 'BCeID Business';

    case SYSTEM_IDENTITY_SOURCE.IDIR:
      return 'IDIR';

    default:
      return null;
  }
};

export const handleFocusFormValues = (project: IGetProjectForViewResponseDetails): number[] => {
  const newValues = [] as number[];

  if (project.is_healing_land) {
    const option = focusOptions.find((option) => option.label === 'Healing the Land');
    if (option) {
      newValues.push(option.value);
    }
  }

  if (project.is_healing_people) {
    const option = focusOptions.find((option) => option.label === 'Healing the People');
    if (option) {
      newValues.push(option.value);
    }
  }

  if (project.is_land_initiative) {
    const option = focusOptions.find(
      (option) => option.label === 'Land Based Restoration Initiative'
    );
    if (option) {
      newValues.push(option.value);
    }
  }

  if (project.is_cultural_initiative) {
    const option = focusOptions.find(
      (option) => option.label === 'Cultural or Community Investment Initiative'
    );
    if (option) {
      newValues.push(option.value);
    }
  }

  return newValues;
};
