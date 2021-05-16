
const isEmpty = (string) => {
  return string.trim() === "";
};

exports.validateLoginData = (data) => {
  const errors = {};
  if (isEmpty(data.email)) errors.email = "Must not be empty.";
  if (isEmpty(data.password)) errors.password = "Must not be empty.";
  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

const isEmail = (email) => {
  const emailRegEx = /\S+@\S+\.\S+/;
  return !!email.match(emailRegEx);
};

exports.validateSignUpData = (data) => {
  const errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty.";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be valid email address.";
  }

  if (isEmpty(data.firstName)) errors.firstName = "Must not be empty.";
  if (isEmpty(data.lastName)) errors.lastName = "Must not be empty.";
  if (isEmpty(data.phoneNumber)) errors.phoneNumber = "Must not be empty.";
  if (isEmpty(data.country)) errors.country = "Must not be empty.";

  if (isEmpty(data.password)) errors.password = "Must not be empty.";
  // eslint-disable-next-line max-len
  if (data.password !== data.confirmPassword) errors.confirmPassword = "Passowrds must be the same.";
  if (isEmpty(data.username)) errors.username = "Must not be empty.";

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};
