const express = require('express'); ;
const { setHeaders, ping } = require('common/utils');
const { logRequest } = require('common/logger');
const { CONFIG } = require('common/config');
const { getAsset } = require('./assets');
const { reloadChannels } = require('./channels');
const { startServer } = require('./server');
const { getLogo } = require('./logos');

const app = express();

app.use(express.json());
app.use(logRequest(CONFIG));
app.use(setHeaders(CONFIG));

app.get('/logo', getLogo(CONFIG));
app.get('/ping', ping(CONFIG));
app.get('/assets/:path', getAsset(CONFIG));
app.post('/channels/reload', reloadChannels(CONFIG));

startServer(CONFIG, app);
