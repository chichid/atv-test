const fs = require('fs');
const path = require('path');

const DevProfile = 'dev';
const ProdProfile = 'prod';
const Profile = process.env.PROFILE;
const SettingsFile = '../../settings.json';
const Settings = fs.existsSync(SettingsFile) ? JSON.parse(fs.readFileSync(SettingsFile)) : {};

const UseSSL = process.env.USE_SSL === 'true' || Settings.USE_SSL;
const Addr = process.env.OPENSHIFT_NODEJS_IP || process.env.ADDR || Settings.Addr;
const Port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || Settings.Port || (UseSSL ? 443 : 80);
const BaseUrl = process.env.BASE_URL || Settings.BASE_URL;
const AppleTvBootstraperFolder = '../appletv-bootstraper';
const SSL = {
  Enabled: UseSSL,
  Key: path.join(__dirname, AppleTvBootstraperFolder + '/certificates/kortv.key'),
  Cert: path.join(__dirname, AppleTvBootstraperFolder + '/certificates/kortv.pem'),
};

const GoogleSheetsEndpoint = 'https://sheets.googleapis.com/v4/spreadsheets';
const GoogleSheetsApiKey = process.env.GOOGLE_SHEETS_API_KEY || Settings.GOOGLE_SHEETS_API_KEY;
const GoogleSheetId = '1XDyp6-zvlorSwmcQRizriub2pAleYskmyvrYOyfYXgA';
const GoogleSheetConfigRange = 'Config!H:N';
if (!GoogleSheetsApiKey) {
  console.warn('[warning] - Config api Key for the google sheets not found, this is necessary for the channels API');
}

const Transcoder = {
  BaseUrl: process.env.TRANSCODER_URL || Settings.TRANSCODER_URL || 'http://localhost:8666',
  FFMpegPath: process.env.FFMPEG_PATH,
  FFProbePath: process.env.FFPROBE_PATH,
  EnableDiscovery: process.env.ENABLE_DISCOVERY === "true" ? true : false,
  WorkQueueLimit: 1,
  ChunkDuration: 10,
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
  Transcoder,
  Discovery, 
  BaseUrl,
  MainTemplate: BaseUrl + '/assets/index.xml',
  EpgTemplatePath: '/assets/epg.xml',
  Profile,
  Addr,
  Port,
  SSL,
  MimeMap,
  XstreamCodes,
};