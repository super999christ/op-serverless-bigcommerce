/**
 * Get full name from the first name and the last name
 * @returns <String>FullName
 */
const getFullName = (firstName, lastName) => {
  return firstName + ' ' + lastName;
};

/**
 * Get full address
 * @returns <String>FullAddress
 */
const getFullAddress = (company, street1, street2, city, state, zip, country_code, country) => {
  return company + '\n' + street1 + '\n' + street2 + '\n' + city + ', ' + state + ' ' + zip + '\n' + country;
};

/**
 * Calculate 100 * value in integer format
 * @returns 100 * value
 */
const getValue100 = (value) => {
  return Math.round(value * 100);
};

export {
  getFullName,
  getFullAddress,
  getValue100
};