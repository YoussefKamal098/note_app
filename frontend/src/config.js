import {parseString} from 'shared-utils/env.utils'

const AppConfig = Object.freeze({
    API_BASE_URL: parseString(process.env.API_BASE_URL, 'http://localhost:5000/api/v1'),
    NOTES_PER_PAGE: 10,
});

export default AppConfig;
