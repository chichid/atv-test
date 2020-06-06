const fs = require('fs');
const path = require('path');

const BaseUrl = process.env.BASE_URL;
const UseSSL = process.env.USE_SSL === 'true';
const Port = process.env.PORT || (UseSSL ? 443 : 80);
const Profile = process.env.PROFILE;
const GoogleSheetsApiKeyArg = process.env.GOOGLE_SHEETS_API_KEY;
const DevProfile = 'dev';
const ProdProfile = 'prod';

const SettingsFile = 'settings.json';
const Settings = fs.existsSync(SettingsFile) ? JSON.parse(fs.readFileSync(SettingsFile)) : {};

const GoogleSheetsEndpoint = 'https://sheets.googleapis.com/v4/spreadsheets';
const GoogleSheetsApiKey = GoogleSheetsApiKeyArg || Settings.GOOGLE_SHEETS_API_KEY;
const GoogleSheetId = '1XDyp6-zvlorSwmcQRizriub2pAleYskmyvrYOyfYXgA';
const GoogleSheetConfigRange = 'Config!H:N';
if (!GoogleSheetsApiKey) {
  console.warn('[warning] - Config api Key for the google sheets not found, this is necessary for the channels API');
}

const AppleTvBootstraperFolder = '/appletv-bootstraper';
const SSL = {
  Enabled: UseSSL,
  Key: path.join(__dirname, AppleTvBootstraperFolder + '/certificates/kortv.key'),
  Cert: path.join(__dirname, AppleTvBootstraperFolder + '/certificates/kortv.pem'),
};

const Transcoder = {
  TmpDir: 'tmp',
  WorkQueueLimit: 1,
  ChunkDuration: 30,
  Port: process.env.TRANSCODER_PORT || 8666,
};

const Discovery = {
  Port: 23456,
  LanAddrPrefix: "192.168",
};

const MimeMap = {
  default: 'text/plain',
  js: 'text/javascript',
  xml: 'text/xml',
};

const XstreamCodes = {
  UserAgent: 'IPTVSmarters',
  GetSimpleDataTable: 'get_simple_data_table',
};

module.exports.CONFIG = {
  ChannelConfigUrl: `${GoogleSheetsEndpoint}/${GoogleSheetId}/values/${GoogleSheetConfigRange}?key=${GoogleSheetsApiKey}`,
  AssetsFolder: 'assets',
  AppleTvBootstraperFolder,
  AppleTvAddress: '192.168.2.39',
  Transcoder,
  Discovery, 
  BaseUrl,
  MainTemplate: BaseUrl + '/assets/templates/index.xml',
  EpgTemplatePath: '/assets/templates/epg.xml',
  Profile,
  Port,
  SSL,
  MimeMap,
  XstreamCodes,
};
