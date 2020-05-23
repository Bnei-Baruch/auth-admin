import kc from "../components/UserManager";

export const getAuthData = (url, cb) => fetch(`${url}`, {
    headers: {
        'Authorization': 'bearer ' + kc.token,
        'Content-Type': 'application/json'
    }
}).then((response) => {
    return response.json().then(data => cb(data));
}).catch(ex => console.log(`get ${url}`, ex));