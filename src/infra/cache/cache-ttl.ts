export const CacheTTL = {
  // Users
  USER: 60 * 60, // 1 hour
  USERS_LIST: 5 * 60, // 5 minutes

  // Questions
  QUESTION: 30 * 60, // 30 minutes
  QUESTIONS_LIST: 3 * 60, // 3 minutes

  // Answers
  ANSWER: 30 * 60, // 30 minutes
  ANSWERS_LIST: 3 * 60, // 3 minutes

  // Comments
  COMMENT: 15 * 60, // 15 minutes
  COMMENTS_LIST: 2 * 60, // 2 minutes

  // Attachments
  ATTACHMENT: 60 * 60, // 1 hour
  ATTACHMENTS_LIST: 10 * 60, // 10 minutes

  // Refresh Tokens
  REFRESH_TOKEN: 15 * 60, // 15 minutes

  // Email Validations
  EMAIL_VALIDATION: 5 * 60, // 5 minutes
} as const
