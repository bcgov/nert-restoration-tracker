import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IConfig } from 'contexts/configContext';
import {
  ensureProtocol,
  getFormattedAmount,
  getFormattedDate,
  getFormattedDateRangeString,
  getFormattedFileSize,
  getLogOutUrl
} from './Utils';

describe('ensureProtocol', () => {
  it('does nothing if string already has `http://`', async () => {
    const url = 'https://someurl.com';
    const urlWithProtocol = ensureProtocol(url);
    expect(urlWithProtocol).toEqual(url);
  });

  it('does nothing if string already has `https://`', async () => {
    const url = 'https://someurl.com';
    const urlWithProtocol = ensureProtocol(url);
    expect(urlWithProtocol).toEqual(url);
  });

  it('adds `https://` when no protocol param is provided', async () => {
    const url = 'someurl.com';
    const urlWithProtocol = ensureProtocol(url);
    expect(urlWithProtocol).toEqual(`https://${url}`);
  });

  it('adds `https://` when provided', async () => {
    const url = 'someurl.com';
    const urlWithProtocol = ensureProtocol(url, 'https://');
    expect(urlWithProtocol).toEqual(`https://${url}`);
  });

  it('adds `http://` when provided', async () => {
    const url = 'someurl.com';
    const urlWithProtocol = ensureProtocol(url, 'http://');
    expect(urlWithProtocol).toEqual(`http://${url}`);
  });
});

describe('getFormattedAmount', () => {
  it('returns a valid amount string when amount is valid', () => {
    const amount = 10000000;
    expect(getFormattedAmount(amount)).toEqual('$10,000,000');
  });

  it('returns empty string when amount is invalid', () => {
    expect(getFormattedAmount(null as unknown as number)).toEqual('');
  });
});

describe('getFormattedDate', () => {
  beforeAll(() => {
    // ignore warning about invalid date string being passed to moment
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it.skip('returns empty string if invalid date is provided', async () => {
    const date = '12312312312312312';
    const formattedDateString = getFormattedDate(DATE_FORMAT.MediumDateFormat, date);
    expect(formattedDateString).toEqual('');
  });

  it('returns formatted date string if valid date is provided', async () => {
    const date = '2021-03-04T22:44:55.478682';
    const formattedDateString = getFormattedDate(DATE_FORMAT.MediumDateFormat, date);
    expect(formattedDateString).toEqual('March 4, 2021');
  });
});

describe.skip('getFormattedDateRangeString', () => {
  beforeAll(() => {
    // ignore warning about invalid date string being passed to moment
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns empty string if invalid startDate is provided', async () => {
    const startDate = '12312312312312312';
    const formattedDateString = getFormattedDateRangeString(
      DATE_FORMAT.MediumDateFormat,
      startDate
    );
    expect(formattedDateString).toEqual('');
  });

  it('returns empty string if invalid endDate is provided', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const endDate = '12312312312312312';
    const formattedDateString = getFormattedDateRangeString(
      DATE_FORMAT.MediumDateFormat,
      startDate,
      endDate
    );
    expect(formattedDateString).toEqual('');
  });

  it('returns formatted string if valid startDate is provided', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const formattedDateString = getFormattedDateRangeString(
      DATE_FORMAT.MediumDateFormat,
      startDate
    );
    expect(formattedDateString).toEqual('March 4, 2021');
  });

  it('returns formatted string if valid startDate is provided', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const endDate = '2021-05-25T22:44:55.478682';
    const formattedDateString = getFormattedDateRangeString(
      DATE_FORMAT.MediumDateFormat,
      startDate,
      endDate
    );
    expect(formattedDateString).toEqual('March 4, 2021 - May 25, 2021');
  });

  it('returns formatted string with custom dateSeparator', async () => {
    const startDate = '2021-03-04T22:44:55.478682';
    const endDate = '2021-05-25T22:44:55.478682';
    const formattedDateString = getFormattedDateRangeString(
      DATE_FORMAT.MediumDateFormat,
      startDate,
      endDate,
      '//'
    );
    expect(formattedDateString).toEqual('March 4, 2021 // May 25, 2021');
  });
});

describe('getLogOutUrl', () => {
  it('returns null when config is null', () => {
    expect(getLogOutUrl(null as unknown as IConfig)).toBeUndefined();
  });

  it('returns null when config is missing `KEYCLOAK_CONFIG.url`', () => {
    const config = {
      API_HOST: '',
      REACT_APP_OBJECT_STORE_URL: '',
      REACT_APP_OBJECT_STORE_BUCKET_NAME: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      REACT_APP_NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: '',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com',
      MAX_UPLOAD_NUM_FILES: 10,
      MAX_UPLOAD_FILE_SIZE: 52428800,
      MAX_IMAGE_UPLOAD_SIZE: 10485760,
      MAX_IMAGE_NUM_FILES: 1,
      ALLOW_MULTIPLE_IMAGE_UPLOADS: false
    };

    expect(getLogOutUrl(config)).toBeUndefined();
  });

  it('returns null when config is missing `KEYCLOAK_CONFIG.realm`', () => {
    const config = {
      API_HOST: '',
      REACT_APP_OBJECT_STORE_URL: '',
      REACT_APP_OBJECT_STORE_BUCKET_NAME: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      REACT_APP_NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.keycloaklogout.com/auth',
        realm: '',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com',
      MAX_UPLOAD_NUM_FILES: 10,
      MAX_UPLOAD_FILE_SIZE: 52428800,
      MAX_IMAGE_UPLOAD_SIZE: 10485760,
      MAX_IMAGE_NUM_FILES: 1,
      ALLOW_MULTIPLE_IMAGE_UPLOADS: false
    };

    expect(getLogOutUrl(config)).toBeUndefined();
  });

  it('returns null when config is missing `SITEMINDER_LOGOUT_URL`', () => {
    const config = {
      API_HOST: '',
      REACT_APP_OBJECT_STORE_URL: '',
      REACT_APP_OBJECT_STORE_BUCKET_NAME: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      REACT_APP_NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.keycloaklogout.com/auth',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: '',
      MAX_UPLOAD_NUM_FILES: 10,
      MAX_UPLOAD_FILE_SIZE: 52428800,
      MAX_IMAGE_UPLOAD_SIZE: 10485760,
      MAX_IMAGE_NUM_FILES: 1,
      ALLOW_MULTIPLE_IMAGE_UPLOADS: false
    };

    expect(getLogOutUrl(config)).toBeUndefined();
  });

  it('returns a log out url', () => {
    // @ts-ignore: delete non-optional property
    delete window.location;

    // @ts-ignore: reassign location despite missing properties
    window.location = {
      origin: 'https://restoration-tracker.com'
    };

    const config = {
      API_HOST: '',
      REACT_APP_OBJECT_STORE_URL: '',
      REACT_APP_OBJECT_STORE_BUCKET_NAME: '',
      CHANGE_VERSION: '',
      NODE_ENV: '',
      REACT_APP_NODE_ENV: '',
      VERSION: '',
      KEYCLOAK_CONFIG: {
        url: 'https://www.keycloaklogout.com/auth',
        realm: 'myrealm',
        clientId: ''
      },
      SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com',
      MAX_UPLOAD_NUM_FILES: 10,
      MAX_UPLOAD_FILE_SIZE: 52428800,
      MAX_IMAGE_UPLOAD_SIZE: 10485760,
      MAX_IMAGE_NUM_FILES: 1,
      ALLOW_MULTIPLE_IMAGE_UPLOADS: false
    };

    expect(getLogOutUrl(config)).toEqual(
      'https://www.siteminderlogout.com?returl=https://www.keycloaklogout.com/auth/realms/myrealm/protocol/openid-connect/logout?redirect_uri=https://restoration-tracker.com/&retnow=1'
    );
  });
});

describe('getFormattedFileSize', () => {
  it('returns `0 KB` if no file size exists', async () => {
    const formattedFileSize = getFormattedFileSize(null as any);
    expect(formattedFileSize).toEqual('0 KB');
  });

  it('returns answer in KB if fileSize < 1000000', async () => {
    const formattedFileSize = getFormattedFileSize(20000);
    expect(formattedFileSize).toEqual('20.0 KB');
  });

  it('returns answer in MB if fileSize < 1000000000', async () => {
    const formattedFileSize = getFormattedFileSize(200000000);
    expect(formattedFileSize).toEqual('200.0 MB');
  });

  it('returns answer in GB if fileSize >= 1000000000', async () => {
    const formattedFileSize = getFormattedFileSize(1000000000);
    expect(formattedFileSize).toEqual('1.0 GB');
  });
});
