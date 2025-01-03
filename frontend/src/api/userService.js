import apiClient from './apiClient';

const ENDPOINTS = {
    GET_USER_INFO: '/users/me',
};

class UserService {
    #apiClient;

    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    async getUserInfo() {
        try {
            const response = await this.#apiClient.instance.get(ENDPOINTS.GET_USER_INFO);

            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Failed to retrieve user information');
        }
    }

    #handleError(error, defaultMessage) {
        throw new Error(error.message || defaultMessage);
    }
}

export default new UserService(apiClient);
