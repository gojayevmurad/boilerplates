export const DTO_MESSAGES = {
  IS_STRING: (field: string) => `${field} must be a string`,
  IS_NOT_EMPTY: (field: string) => `${field} is required`,
  IS_EMAIL: (field: string) => `${field} must be an email`,
};
