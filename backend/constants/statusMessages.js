const statusMessages = Object.freeze({
    // =======================
    // User-related errors
    // =======================
    USER_CREATION_FAILED: "Failed to create a new user. Please try again later.",
    USER_UPDATE_FAILED: "Unable to update user details. Ensure the provided data is correct and try again.",
    USER_LOGIN_FAILED: "Login attempt unsuccessful. Verify your email and password, then try again.",
    USER_REGISTRATION_FAILED: "User registration failed. Please ensure all required fields are correctly filled.",
    USER_NOT_FOUND: "User not found with provided Id",

    // =======================
    // User-specific update errors
    // =======================
    PASSWORD_UPDATE_FAILED: "Failed to update the password. Please try again later.",
    EMAIL_UPDATE_FAILED: "Unable to update the email address. Ensure it is valid and try again.",
    FULLNAME_UPDATE_FAILED: "Failed to update the user's full name. Please try again later.",
    REFRESH_TOKEN_UPDATE_FAILED: "Could not update the user's refresh token. Please log in again.",

    // =======================
    // Note-related errors
    // =======================
    NOTE_CREATION_FAILED: "Failed to create the note. Please check your inputs and try again later.",
    NOTE_UPDATE_FAILED: "Unable to update the note. Ensure the note exists and your data is valid and try again later.",
    NOTE_DELETION_FAILED: "Unable to delete the note. It may not exist or is not associated with your account.",
    NOTE_NOT_FOUND: "The note you requested does not exist or could not be located in the system.",
    USER_NOTE_NOT_FOUND: "The note you requested either does not exist or is not linked to your account.",
    NOTES_FETCH_FAILED: "Failed to retrieve notes. Please try again later.",
    NOTE_FETCH_FAILED: "Failed to retrieve note. Please try again later.",

    // =======================
    // Authentication errors
    // =======================
    INVALID_CREDENTIALS: "The email or password you provided is incorrect. Please try again.",
    CREDENTIALS_REQUIRED: "Email and password are required. Please provide them to log in.",
    INVALID_OR_EXPIRED_TOKEN: "The token provided is invalid or has expired. Please log in again.",
    INVALID_ACCESS_TOKEN: "Invalid or expired access token. Please authenticate again.",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token. Please log in again.",
    TOKEN_EXPIRED: "Your session has expired. Please log in again to continue.",
    INVALID_TOKEN: "The token provided is invalid or expired. Please authenticate again.",
    ACCESS_TOKEN_NOT_PROVIDED: "Access token is missing. Please provide a valid access token in the 'Authorization' header to access this resource.",
    REFRESH_TOKEN_NOT_PROVIDED: "Refresh token is missing. Please provide a valid refresh token as a cookie to renew your session.",
    REFRESH_TOKEN_EXPIRED: "Your refresh token has expired. Please log in to obtain a new one.",
    ACCESS_TOKEN_EXPIRED: "Your access token has expired. Please log in to obtain a new one.",
    USER_NOT_AUTHORIZED: "User not authorized. Please log in to continue.",
    USER_ALREADY_EXISTS: "User already exists. Please log in or use a different email.",

    // =======================
    // General errors
    // =======================
    SERVER_ERROR: "An unexpected server error occurred. Please try again later.",
    RESOURCE_NOT_FOUND: "The requested resource could not be found. Verify the URL and try again.",
    CORS_NOT_ALLOWED: "Cross-Origin Resource Sharing (CORS) is not allowed from this origin. Access to the requested resource has been denied.",
    REQUEST_TIMEOUT: "The server took too long to respond. Please try again later.",
    TOO_MANY_REQUESTS: "You have made too many requests in a short period. Please try again later.",
});

module.exports = statusMessages