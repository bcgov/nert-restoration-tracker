/**
 * Make sure to add the type definition for any new methods added here to the `types/yup.d.ts` types file.
 * - See types/yup.d.ts
 */

import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { focus, getFocusCodeFromLabel } from 'constants/misc';
import dayjs from 'dayjs';
import * as yup from 'yup';

export const locationRequired = (focuses: number[] | IMultiAutocompleteFieldOption[]) => {
  return focuses.some((values: number | IMultiAutocompleteFieldOption) => {
    if (
      values == getFocusCodeFromLabel(focus.HEALING_THE_LAND) ||
      values == getFocusCodeFromLabel(focus.LAND_BASED_RESTORATION_INITIATIVE)
    ) {
      return true;
    }
    return false;
  });
};

yup.addMethod(
  yup.string,
  'isAuthDescriptionRequired',
  function (AuthType: string, message: string) {
    return this.test('is-auth-description-required', message, function (value) {
      if (this.parent.authorization_type) {
        return this.parent.authorization_type == AuthType ? !!value : true;
      }
      return true;
    });
  }
);

yup.addMethod(yup.number, 'isNumberOfPeopleInvolvedRequired', function (message: string) {
  return this.test('is-number-of-people-involved-required', message, function (value) {
    if (this.parent.focuses) {
      const isPeople = this.parent.focuses.some(
        (values: number | IMultiAutocompleteFieldOption) => {
          return values == getFocusCodeFromLabel(focus.HEALING_THE_PEOPLE);
        }
      )
        ? true
        : false;

      if (isPeople) {
        return value !== null;
      }
      return true;
    }
  });
});

yup.addMethod(yup.number, 'isLocationRequired', function (message: string) {
  return this.test('is-location-required', message, function (value) {
    if (this.parent.focuses) {
      return locationRequired(this.parent.focuses) ? !!value : true;
    }
    return true;
  });
});

yup.addMethod(yup.string, 'isLocationRequired', function (message: string) {
  return this.test('is-location-required', message, function (value) {
    if (this.parent.focuses) {
      return locationRequired(this.parent.focuses) ? !!value : true;
    }
    return true;
  });
});

yup.addMethod(yup.array, 'isLocationRequired', function (message: string) {
  return this.test('is-location-required', message, function (value) {
    if (this.parent.focuses) {
      return locationRequired(this.parent.focuses) ? !!value : true;
    }
    return true;
  });
});

yup.addMethod(yup.array, 'isUniquePermitNumber', function (message: string) {
  return this.test('is-unique-permit-number', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const seen = new Set();
    const hasDuplicates = values.some((permit) => {
      return seen.size === seen.add(permit.permit_number).size;
    });

    return !hasDuplicates;
  });
});

yup.addMethod(yup.array, 'isUniqueFocalAncillarySpecies', function (message: string) {
  return this.test('is-unique-focal-ancillary-species', message, function (values) {
    if (!values || !values.length) {
      return true;
    }

    let hasDuplicates = false;

    this.parent.focal_species.forEach((species: number) => {
      if (values.includes(species)) {
        hasDuplicates = true;
      }
    });

    return !hasDuplicates;
  });
});

yup.addMethod(
  yup.string,
  'isValidDateString',
  function (dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat, message = 'Invalid date') {
    return this.test('is-valid-date', message, (value) => {
      if (!value) {
        // don't validate date string if it is null
        return true;
      }

      return dayjs(value, dateFormat, true).isValid();
    });
  }
);

yup.addMethod(
  yup.string,
  'isEndTimeAfterStartTime',
  function (startTimeName: string, message = 'End time must be after start time') {
    return this.test('is-end-time-after-start-time', message, function (value) {
      if (!value) {
        // don't validate end_time if it is null
        return true;
      }

      const endDateTime = dayjs(
        `2020-10-20 ${this.parent.end_time}`,
        DATE_FORMAT.ShortDateTimeFormat
      );
      const startDateTime = dayjs(
        `2020-10-20 ${this.parent[startTimeName]}`,
        DATE_FORMAT.ShortDateTimeFormat
      );

      // compare valid start and end times
      return startDateTime.isBefore(endDateTime);
    });
  }
);

yup.addMethod(
  yup.string,
  'isEndDateAfterStartDate',
  function (
    startDateName: string,
    dateFormat: DATE_FORMAT = DATE_FORMAT.ShortDateFormat,
    message = 'End date must be after start date'
  ) {
    return this.test('is-end-date-after-start-date', message, function (value) {
      if (!value) {
        // don't validate end_date if it is null
        return true;
      }

      if (!dayjs(this.parent[startDateName], dateFormat, true).isValid()) {
        // don't validate start_date if it is invalid
        return true;
      }

      // compare valid start and end dates
      return dayjs(this.parent.start_date, dateFormat, true).isBefore(
        dayjs(value, dateFormat, true)
      );
    });
  }
);

yup.addMethod(
  yup.string,
  'isBeforeDate',
  function (maxDate: string | undefined, dateFormat: DATE_FORMAT, message: string) {
    return this.test('is-before-date', message, function (value) {
      if (!value || !maxDate) {
        // don't validate date if it is null
        return true;
      }

      if (dayjs(value, dateFormat).isAfter(dayjs(maxDate))) {
        return false;
      }

      return true;
    });
  }
);

yup.addMethod(
  yup.string,
  'isAfterDate',
  function (minDate: string | undefined, dateFormat: DATE_FORMAT, message: string) {
    return this.test('is-after-date', message, function (value) {
      if (!value || !minDate) {
        // don't validate date if it is null
        return true;
      }

      if (dayjs(value, dateFormat).isBefore(dayjs(minDate))) {
        return false;
      }

      return true;
    });
  }
);

yup.addMethod(yup.array, 'isUniqueAuthor', function (message: string) {
  return this.test('is-unique-author', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const seen = new Set();
    const hasDuplicates = values.some((author) => {
      const authorName = `${author.first_name?.trim()} ${author.last_name?.trim()}`;
      return seen.size === seen.add(authorName).size;
    });

    return !hasDuplicates;
  });
});

yup.addMethod(yup.array, 'isUniquePartnership', function (message: string) {
  return this.test('is-unique-partnership', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const seen = new Set();
    const hasDuplicates = values.some((partnerships) => {
      return seen.size === seen.add(partnerships.partnership).size;
    });

    return !hasDuplicates;
  });
});

yup.addMethod(yup.array, 'isUniqueConservationArea', function (message: string) {
  return this.test('is-unique-conservation-area', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const seen = new Set();
    const hasDuplicates = values.some((conservationAreas) => {
      return seen.size === seen.add(conservationAreas.conservationArea).size;
    });

    return !hasDuplicates;
  });
});

yup.addMethod(yup.array, 'isUniqueObjective', function (message: string) {
  return this.test('is-unique-objective', message, (values) => {
    if (!values || !values.length) {
      return true;
    }

    const seen = new Set();
    const hasDuplicates = values.some((objectives) => {
      return seen.size === seen.add(objectives.objective).size;
    });

    return !hasDuplicates;
  });
});

yup.addMethod(
  yup.array,
  'isConservationAreasRequired',
  function (booleanName: string, message: string) {
    return this.test('is-conservation-areas-required', message, function (value) {
      if (this.parent[booleanName] === 'false') {
        return true;
      }

      if (value && value.length > 0) {
        return value.some((data) => {
          if (!data.conservationArea) {
            return false;
          }

          return data.conservationArea !== '';
        });
      }

      if (!value) {
        return false;
      }
    });
  }
);

export default yup;
