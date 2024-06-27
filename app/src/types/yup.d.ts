/**
 * Extend the default yup type definitions to include the definitions of our custom validators
 * - See utils/YupSchema.ts
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import yup from 'utils/YupSchema';

declare module 'yup' {
  interface StringSchema {
    isConservationAreasRequired(
      booleanName: string,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the string is a valid date string. Does nothing if the string is null.
     *
     * @param {DATE_FORMAT} dateFormat=DATE_FORMAT.ShortDateFormat - date format the string must match
     * @param {string} message='Invalid Date' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof StringSchema
     */
    isValidDateString(
      dateFormat?: DATE_FORMAT,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the end date string is after the start date string. Does nothing if either the end or start
     * date strings are null or invalid.
     *
     * @param {string} startDateName - name of the start date field
     * @param {DATE_FORMAT} dateFormat=DATE_FORMAT.ShortDateFormat - date format the string must match
     * @param {string} message='Invalid Date' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof StringSchema
     */
    isEndDateAfterStartDate(
      startDateName: string,
      dateFormat?: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the end time string is after the start time string. Does nothing if either the end or start
     * time strings are null or invalid.
     *
     * @param {string} startTimeName - name of the start time field
     * @param {string} message='Invalid Time' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof StringSchema
     */
    isEndTimeAfterStartTime(
      startTimeName: string,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if a date is after a given min date
     *
     * @param {ISOString} minDate - min date not to be preceeded in ISOString format
     * @param {DATE_FORMAT} dateFormat=DATE_FORMAT.ShortDateFormat - date format the string must match
     * @param {string} message=error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof StringSchema
     */
    isAfterDate(
      minDate: string | undefined,
      dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if a date is before a given max date
     *
     * @param {ISOString} maxDate - max date not to be exceeded in ISOString format
     * @param {DATE_FORMAT} dateFormat=DATE_FORMAT.ShortDateFormat - date format the string must match
     * @param {string} message=error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof StringSchema
     */
    isBeforeDate(
      maxDate: string | undefined,
      dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
      message?: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;
  }

  interface ArraySchema {
    /**
     * Determine if the array of permits has duplicate permit numbers
     *
     * @param {string} message='Permit numbers must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniquePermitNumber(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the array of partnerships has duplicate partnership string
     *
     * @param {string} message='Parnership entries must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniquePartnership(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the array of conservation areas has duplicate conservation area string
     *
     * @param {string} message='Conservation area entries must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniqueConservationArea(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the array of objective has duplicate objective string
     *
     * @param {string} message='Objective entries must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniqueObjective(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the array of classification details has duplicates
     *
     * @param {string} message='IUCN Classifications must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniqueIUCNClassificationDetail(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the object of focal and ancillary species has duplicates
     *
     * @param {string} message='Focal and Ancillary species must be unique' - error message if this check fails
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniqueFocalAncillarySpecies(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;

    /**
     * Determine if the author array contains unique `first_name`/`last_name` pairs.
     *
     * @param {string} message
     * @return {*}  {(yup.StringSchema<string | undefined, Record<string, any>, string | undefined>)}
     * @memberof ArraySchema
     */
    isUniqueAuthor(
      message: string
    ): yup.StringSchema<string | undefined, Record<string, any>, string | undefined>;
  }
}
