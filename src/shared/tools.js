import kc from "../components/UserManager";
import {API_URL} from "./env";

export const getAuthData = (url, cb) => fetch(`${url}`, {
    headers: {
        'Authorization': 'bearer ' + kc.token,
        'Content-Type': 'application/json'
    }
}).then((response) => {
    return response.json().then(data => cb(data));
}).catch(ex => console.log(`get ${url}`, ex));

export const getVhData = (url, cb) => {
    fetch(`${API_URL}/${url}`, {
        headers: {
            'Authorization': 'bearer ' + kc.token,
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.json().then(data => cb(data));
    }).catch(ex => console.log(`get ${url}`, ex));
}
