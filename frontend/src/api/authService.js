import EventEmitter from 'events';
import {HttpStatusCode} from "../constants/httpStatus";
import httpHeaders from "../constants/httpHeaders";
import apiClient from './apiClient';
import tokenStorageService from '../services/tokenStorageService';
import userService from './userService';

const AUTH_EVENTS = Object.freeze({
    LOGIN: 'login',
    LOGOUT: 'logout',
    SESSION_EXPIRED: 'session_expired',
});

const ENDPOINTS = {
    REFRESH: 'auth/refresh',
    LOGIN: 'auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
};

class AuthService {
    #apiClient;
    #tokenStorageService;
    #eventEmitter;
    #userService;

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

    /**
     * Handles response errors, including token expiration and refresh.
     * @param {Object} error - The error object from the failed response.
     * @returns {Promise} The promise rejection or retry of the original request.
     */
    async #handleResponseError(error) {
        const originalRequest = error.config;

        if (
            originalRequest.url.includes(ENDPOINTS.REFRESH) ||
            originalRequest.url.includes(ENDPOINTS.LOGOUT)
        ) {
            return Promise.reject(error);
        }

        if (error.response?.status === HttpStatusCode.UNAUTHORIZED && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const {accessToken} = await this.#refreshAccessToken();
                originalRequest.headers[httpHeaders.AUTHORIZATION] = `Bearer ${accessToken}`;
                return this.#apiClient.instance(originalRequest);
            } catch (refreshError) {
                return new Promise(() => ({}));
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
            return {accessToken: data.accessToken};
        } catch (error) {
            this.#handleRefreshTokenFailure();
            throw new Error(`Token refresh failed: ${error}`);
        }
    }

    /**
     * Handles token failure by clearing the stored access token and emitting a failure event.
     */
    #handleRefreshTokenFailure() {
        this.#tokenStorageService.clearAccessToken();
        this.#eventEmitter.emit(AUTH_EVENTS.SESSION_EXPIRED);
    }

    /**
     * Handles user logout by clearing the stored access token and emitting a logout event.
     */
    #handleLogout() {
        this.#tokenStorageService.clearAccessToken();
        this.#eventEmitter.emit(AUTH_EVENTS.LOGOUT);
    }

    /**
     * Logs in a user by posting the credentials to the login endpoint and storing the access token.
     * @param {Object} credentials - The user credentials.
     * @param {string} credentials.email - The user's email.
     * @param {string} credentials.password - The user's password.
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If login fails.
     */
    async login({email, password}) {
        try {
            const response = await this.#apiClient.post(ENDPOINTS.LOGIN, {email, password});
            const {accessToken} = response.data;

            this.#tokenStorageService.setAccessToken(accessToken);

            const user = await this.#userService.getAuthenticatedUser();
            const {id, firstname, lastname} = user.data;

            this.#eventEmitter.emit(AUTH_EVENTS.LOGIN, {user: {id, email, firstname, lastname}});

            return response;
        } catch (error) {
            return this.#handleError(error, 'Login failed');
        }
    }

    /**
     * Logs out the current user by calling the logout endpoint and clearing the stored token.
     * @returns {Promise<Object>} Response with status code and a message.
     * @throws {Error} If logout fails.
     */
    async logout() {
        try {
            const response = await this.#apiClient.post(ENDPOINTS.LOGOUT);
            return {...response, message: 'Logged out successfully'};
        } catch (error) {
            return this.#handleError(error, 'Logout failed');
        } finally {
            this.#handleLogout();
        }
    }

    /**
     * Registers a new user by posting their information to the register endpoint.
     * @param {Object} user - The user registration data.
     * @param {string} user.email - The user's email.
     * @param {string} user.password - The user's password.
     * @param {string} user.firstname - The user's first name.
     * @param {string} user.lastname - The user's last name.
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If registration fails.
     */
    async register({email, password, firstname, lastname}) {
        try {
            const response = await this.#apiClient.post(ENDPOINTS.REGISTER, {
                email,
                password,
                firstname,
                lastname,
            });
            const {accessToken} = response.data;

            this.#tokenStorageService.setAccessToken(accessToken);
            this.#eventEmitter.emit(AUTH_EVENTS.LOGIN, {user: {email, firstname, lastname}});

            return response;
        } catch (error) {
            return this.#handleError(error, 'Registration failed');
        }
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

    /**
     * Handles errors by throwing a new error with a meaningful message.
     * @param {Error} error - The error object.
     * @param {string} defaultMessage - The default message to use if the error does not have one.
     * @throws {Error} A wrapped error with a meaningful message.
     */
    #handleError(error, defaultMessage) {
        throw new Error(error.message || defaultMessage);
    }
}

const authService = new AuthService(apiClient, tokenStorageService, userService)

export {AUTH_EVENTS};
export default authService;
