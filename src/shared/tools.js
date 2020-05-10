import {AUTH_URL} from "../components/UserManager";

export const getToken = () => {
    let jwt = sessionStorage.getItem(`oidc.user:${AUTH_URL}:galaxy`);
    let json = JSON.parse(jwt);
    return json.access_token;
};

export const getAuthData = (url, cb) => fetch(`${url}`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
}).then((response) => {
    return response.json().then(data => cb(data));
}).catch(ex => console.log(`get ${url}`, ex));