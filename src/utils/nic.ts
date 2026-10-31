/**
 * Utility functions for Sri Lankan NIC numbers.
 * Mirrors the backend rule so a number the server would refuse is caught in the form.
 */

const NIC_OLD = /^\d{9}[VX]$/;
const NIC_NEW = /^\d{12}$/;
const NIC_MIN_AGE = 15;
const NIC_OLDEST_BIRTH_YEAR = 1915;

/**
 * Canonical NIC as the backend stores it: no spaces or dashes, upper-case suffix.
 */
export const normalizeNic = (value: string): string =>
  value.replace(/[\s-]/g, "").toUpperCase();

/**
 * Validates a NIC: 9 digits + V/X or 12 digits, encoding a possible birth date.
 * - Birth year between 1915 and (this year - 15).
 * - Day of year 1-366 (women's numbers have 500 added); day 60 only in a leap year.
 */
export const isValidNic = (value: string): boolean => {
  const nic = normalizeNic(value);

  let year: number;
  let day: number;
  if (NIC_OLD.test(nic)) {
    year = 1900 + Number(nic.slice(0, 2));
    day = Number(nic.slice(2, 5));
  } else if (NIC_NEW.test(nic)) {
    year = Number(nic.slice(0, 4));
    day = Number(nic.slice(4, 7));
  } else {
    return false;
  }

  const thisYear = new Date().getUTCFullYear();
  if (year < NIC_OLDEST_BIRTH_YEAR || year > thisYear - NIC_MIN_AGE) return false;
  if (day > 500) day -= 500;
  if (day < 1 || day > 366) return false;
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return !(day === 60 && !isLeapYear);
};
