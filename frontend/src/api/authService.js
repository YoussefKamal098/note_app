import EventEmitter from 'events';
import {HttpStatusCode} from "@/constants/httpStatus";
import httpHeaders from "../constants/httpHeaders";
import errorCodes from '../constants/errorCodes';
import apiClient from './apiClient';
import tokenStorageService from '../services/tokenStorageService';
import userService from './userService';

const AUTH_EVENTS = Object.freeze({
    LOGIN: 'login',
    LOGOUT: 'logout',
    SESSION_EXPIRED: 'session_expired',
    ACCESS_TOKEN_EXPIRED: 'access_token_expired',
    ACCESS_TOKEN_REFRESHED: 'access_token_refreshed',
});

const ENDPOINTS = {
    REFRESH: 'auth/refresh',
    LOGIN: 'auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: 'auth/verify_email',
    GOOGLE_AUTH: '/auth/google',
    GOOGLE_AUTH_CALLBACK: '/auth/google/callback'
};

class AuthService {
    #apiClient;
    #tokenStorageService;
    #eventEmitter;
    #userService;
    #tokenWatchInterval = null;

    /**
     * Creates an instance of AuthService.
     * @param {ApiClient} apiClient - The API client instance for making HTTP requests.
     * @param {TokenStorageService} tokenStorageService - The token storage instance to manage access tokens.
     * @param {UserService} userService - The user service instance to retrieve user information.
     */
    constructor(apiClient, tokenStorageService, userService) {
        this.#apiClient = apiClient;
        this.#tokenStorageService = tokenStorageService;
        this.#eventEmitter = new EventEmitter();
        this.#userService = userService;

        this.#setupInterceptors();
    }

    /**
     * Sets up request and response interceptors for the API client.
     * Adds the authentication token to outgoing requests and handles token refresh on 401 errors.
     */
    #setupInterceptors() {
        this.#apiClient.addRequestInterceptor(
            (config) => this.#addAuthTokenToRequest(config),
            (error) => Promise.reject(error)
        );

        this.#apiClient.addResponseInterceptor(
            (response) => response,
            async (error) => this.#handleResponseError(error)
        );
    }

    /**
     * Adds the access token to the request headers.
     * @param {Object} config - The request configuration object.
     * @returns {Object} The modified request configuration with the access token.
     */
    #addAuthTokenToRequest(config) {
        const token = this.#tokenStorageService.getAccessToken();
        if (token) {
            config.headers[httpHeaders.AUTHORIZATION] = `Bearer ${token}`;
        }
        return config;
    }

    #startTokenWatcher() {
        const checkInterval = 60 * 1000; // every 60 seconds
        this.#stopTokenWatcher();

        this.#tokenWatchInterval = setInterval(() => {
            if (!this.#tokenStorageService.getAccessToken()) return;

            if (this.#tokenStorageService.isTokenExpiringSoon()) {
                console.warn('[AuthService] Token expiring soon — refreshing');

                this.#refreshAccessToken().catch((err) => {
                    console.error('[AuthService] Auto-refresh failed', err);
                });
            }
        }, checkInterval);
    }

    #stopTokenWatcher() {
        if (this.#tokenWatchInterval) {
            clearInterval(this.#tokenWatchInterval);
            this.#tokenWatchInterval = null;
        }
    }

    /**
     * Returns the current access token.
     * @returns {string|null} Access token if available, otherwise null.
     */
    getAccessToken() {
        return this.#tokenStorageService.getAccessToken();
    }

    /**
     * Decodes the current access token to extract the session ID (jti claim).
     * Returns null if no valid token exists or decoding fails.
     * @returns {string|null} The session ID or null
     */
    getSessionId() {
        const payload = this.#tokenStorageService.getPayload();
        return payload?.jti || payload?.sessionId || null;
    }

    /**
     * Handles response errors, including token expiration and refresh.
     * @param {Object} error - The error object from the failed response.
     * @returns {Promise} The promise rejection or retry of the original request.
     */
    async #handleResponseError(error) {
        const originalRequest = error.config;

        if (error.response?.status === HttpStatusCode.UNAUTHORIZED &&
            error.response?.data?.code === errorCodes.ACCESS_TOKEN_FAILED &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            this.#eventEmitter.emit(AUTH_EVENTS.ACCESS_TOKEN_EXPIRED);
            this.#stopTokenWatcher();

            try {
                const {accessToken} = await this.#refreshAccessToken();
                originalRequest.headers[httpHeaders.AUTHORIZATION] = `Bearer ${accessToken}`;
                return this.#apiClient.request(originalRequest);
            } catch (refreshError) {
                if (refreshError.response?.status === HttpStatusCode.UNAUTHORIZED) {
                    // If refresh fails with 401, return an unresolved promise.
                    return new Promise(() => ({}));
                } else {
                    // For any other error, reject with the refresh error.
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }

    /**
     * Refreshes the access token using the refresh token endpoint.
     * @returns {Object} The new access token.
     * @throws {Error} If token refresh fails.
     */
    async #refreshAccessToken() {
        try {
            const {data} = await this.#apiClient.post(ENDPOINTS.REFRESH);
            this.#tokenStorageService.setAccessToken(data.accessToken);
            this.#startTokenWatcher();
            this.#eventEmitter.emit(AUTH_EVENTS.ACCESS_TOKEN_REFRESHED, data.accessToken);
            return {accessToken: data.accessToken};
        } catch (error) {
            if (error.response && error.response.status === HttpStatusCode.UNAUTHORIZED) {
                this.#handleRefreshTokenFailure();
            }
            throw error;
        }
    }

    /**
     * Handles token failure by clearing the stored access token and emitting a failure event.
     */
    #handleRefreshTokenFailure() {
        this.#tokenStorageService.clearAccessToken();
        this.#startTokenWatcher();
        this.#eventEmitter.emit(AUTH_EVENTS.SESSION_EXPIRED);
    }

    /**
     * Handles user logout by clearing the stored access token and emitting a logout event.
     */
    #handleLogout() {
        this.#tokenStorageService.clearAccessToken();
        this.#stopTokenWatcher();
        this.#eventEmitter.emit(AUTH_EVENTS.LOGOUT);
    }

    /**
     * Handles successful login by storing the access token, fetching user details,
     * and emitting the login event.
     *
     * @private
     * @param {string} accessToken - The new access token.
     * @param {import('axios').AxiosRequestConfig} config - Axios request configuration.
     * @returns {Promise<Object>} The user data object.
     */
    async #handleLoginSuccess(accessToken, config) {
        // Store the new access token
        this.#tokenStorageService.setAccessToken(accessToken);
        this.#startTokenWatcher();

        // Fetch user details
        const user = await this.#userService.getUser({id: "me"}, config);
        const {id, email, firstname, lastname, avatarUrl} = user.data;

        // Emit the login event with user details
        this.#eventEmitter.emit(AUTH_EVENTS.LOGIN, {user: {id, email, firstname, lastname, avatarUrl}});

        return user;
    }

    /**
     * Logs in a user by posting the credentials to the login endpoint and storing the access token.
     * @param {Object} credentials - The user credentials.
     * @param {string} credentials.email - The user's email.
     * @param {string} credentials.password - The user's password.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If login fails.
     */
    async login({email, password}, config = {}) {
        const response = await this.#apiClient.post(ENDPOINTS.LOGIN, {email, password}, config);
        const {accessToken} = response.data;

        await this.#handleLoginSuccess(accessToken, config);
        return response;
    }

    /**
     * Initiates Google OAuth 2.0 authentication flow.
     * @async
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response containing authorization URL and state
     * @throws {Error} If the initiation request fails
     */
    async initiateGoogleAuth(config = {}) {
        return await this.#apiClient.post(ENDPOINTS.GOOGLE_AUTH, config);
    }

    /**
     * Handles Google OAuth callback with authorization code
     * @async
     * @param {Object} params - Callback parameters from Google
     * @param {string} params.code - Authorization code from Google (required)
     * @param {string} [params.state] - State parameter for CSRF validation (optional)
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Authentication result with user data and tokens
     * @throws {Error} If code is missing or token exchange fails
     */
    async handleGoogleCallback({code, state} = {}, config = {}) {
        const response = await this.#apiClient.post(ENDPOINTS.GOOGLE_AUTH_CALLBACK, {code, state}, config);
        const {accessToken} = response.data;

        await this.#handleLoginSuccess(accessToken, config);
        return response;
    }

    /**
     * Logs out the current user by calling the logout endpoint and clearing the stored token.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and a message.
     * @throws {Error} If logout fails.
     */
    async logout(config = {}) {
        try {
            const response = await this.#apiClient.post(ENDPOINTS.LOGOUT, config);
            this.#handleLogout();
            return {...response, message: 'Logged out successfully'};
        } catch (error) {
            if (error.response && error.response.status === HttpStatusCode.UNAUTHORIZED) {
                this.#handleLogout();
            }

            throw error;
        }
    }

    /**
     * Registers a new user.
     * <p>
     * This method sends a POST request to the register endpoint with the user's registration data.
     * </p>
     *
     * @async
     * @param {Object} userData - The registration details for the new user.
     * @param {string} userData.email - The email address of the new user.
     * @param {string} userData.password - The password for the new user.
     * @param {string} userData.firstname - The first name of the new user.
     * @param {string} userData.lastname - The last name of the new user.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} The API response from the register endpoint.
     * @throws {Error} If the registration process fails.
     */
    async register({email, password, firstname, lastname}, config = {}) {
        return await this.#apiClient.post(ENDPOINTS.REGISTER, {
            email,
            password,
            firstname,
            lastname,
        }, config);
    }

    /**
     * Verifies the user's email using an OTP.
     * <p>
     * This method sends a POST request to the verify-email endpoint with the provided
     * email and OTP.
     * On a successful response, it sets the access token, retrieves the
     * authenticated user's details, and emits a login event with the user's information.
     * </p>
     *
     * @async
     * @param {Object} params - The parameters for email verification.
     * @param {string} params.email - The email address to verify.
     * @param {string} params.otpCode - The one-time password (OTP) sent to the user's email.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} The API response from the verify-email endpoint.
     * @throws {Error} If the email verification process fails.
     */
    async verifyEmail({email, otpCode}, config = {}) {
        const response = await this.#apiClient.post(ENDPOINTS.VERIFY_EMAIL, {email, otpCode});
        const {accessToken} = response.data;

        await this.#handleLoginSuccess(accessToken, config);
        return response;
    }

    /**
     * Adds an event listener for a specific authentication event.
     * @param {string} event - The event to listen for.
     * @param {Function} listener - The listener function to execute when the event is emitted.
     */
    on(event, listener) {
        this.#eventEmitter.on(event, listener);
    }

    /**
     * Removes an event listener for a specific authentication event.
     * @param {string} event - The event to stop listening for.
     * @param {Function} listener - The listener function to remove.
     */
    off(event, listener) {
        this.#eventEmitter.off(event, listener);
    }
}

const authService = new AuthService(apiClient, tokenStorageService, userService);

export {AUTH_EVENTS};
export default authService;
