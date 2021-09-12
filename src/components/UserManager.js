import Keycloak from 'keycloak-js';
import {KC_URL} from "../shared/env";

const userManagerConfig = {
    url: `${KC_URL}`,
    realm: "main",
    clientId: "auth-admin",
};

const initOptions = {
    onLoad: "check-sso",
    checkLoginIframe: false,
    flow: "standard",
    pkceMethod: "S256",
    enableLogging: true,
};

export const kc = new Keycloak(userManagerConfig);

kc.onTokenExpired = () => {
    renewToken(0);
};

kc.onAuthLogout = () => {
    kc.logout();
};

const renewToken = (retry) => {
    retry++;
    kc.updateToken(5)
        .then(refreshed => {
            if (refreshed) {
                console.debug(refreshed)
            }
        })
        .catch(() => {
            if (retry > 10) {
                kc.clearToken();
            } else {
                setTimeout(() => {
                    renewToken(retry);
                }, 10000);
            }
        });
};

const setData = () => {
    const {realm_access: {roles}, sub, given_name, name, email} = kc.tokenParsed;
    let user = {id: sub, display: name, username: given_name, name, email, roles};
    return user;
};

export const getUser = (callback) => {
    kc.init(initOptions)
        .then(authenticated => {
            const user = authenticated ? setData() : null;
            callback(user);
        })
        .catch(err => console.error(err));
};

export default kc;
