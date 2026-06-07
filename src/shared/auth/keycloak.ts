import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost:8180',
    realm: 'inventory',
    clientId: 'inventory-front',
});

export default keycloak;