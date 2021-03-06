const dgram = require('dgram');
const os = require('os');
const { CONFIG } = require('common/config');

const brothers = {};
const server = dgram.createSocket({type: 'udp4', reuseAddr: true});

const Messages = {
	Bonjour: 'Bonjour!',
	Bye: 'Bye',
};

export const startDiscoveryService = () => {
  console.log(`[discovery] discovery service initializing...`);
  server.bind(CONFIG.Discovery.Port);

  process.on('SIGINT', () => {
    console.log(`[discovery] SIGINT`);
    setTimeout(() => process.exit(), 500);
  });

  process.on('exit', () => {
    console.log(`[discovery] process will exit`);
    sendMessage(Messages.Bye);
  });
};

export const getWorkerList = async () => new Promise((resolve, reject) => {
  const byCpuScore =  (a, b) => brothers[b].cpuScore - brothers[a].cpuScore;
  const workerUrls = Object.keys(brothers)
    .sort(byCpuScore)
    .map(worker => `http://${worker}`);

  resolve(workerUrls);
});

// TODO refactor these to be functions
server.on('listening', () => {
  const address = server.address();
  console.log(`[discovery] discovery service listening at ${address.address}:${address.port}, sending bonjour message...`);

	server.setBroadcast(true);
  sendBonjour();
});

server.on('close', () => {
  console.log(`[discovery] close event received, sending bye`);
	sendMessage(Messages.Bye);
});

server.on('error', (err) => {
  console.log(`[discovery] server error:\n${err.stack}`);
  server.close();
});


server.on('message', (message, rinfo) => {
	const { port, address } = rinfo;

	if (!address.startsWith(CONFIG.Discovery.LanAddrPrefix)) {
		return;
	}

  const isLocalAddress = getLocalAddresses().indexOf(message) !== -1;
  if (isLocalAddress && message.pid === process.pid) {
    return;
  }

  const { payload, type } = JSON.parse(message.toString());

  switch(type) {
    case Messages.Bonjour: {
      const { transcoderPort } = payload || {};
      const key = address + ':' + transcoderPort;

      if (transcoderPort && !brothers[key]) {
        brothers[key] = payload;

        console.log(`[discovery] registering device ${rinfo.address}:${transcoderPort}/${rinfo.port}`);
        console.log(`[discovery] devices now are ${Object.keys(brothers)}`)
      }

      sendBonjour();
    } break;
    case Messages.Bye: {
      const { transcoderPort } = payload || {};
      const key = address + ':' + transcoderPort;

      if (transcoderPort && brothers[key]) {
        console.log(`[discovery] unregistering device ${rinfo.address}:${transcoderPort}/${rinfo.port}`);
        delete brothers[key];
        console.log(`[discovery] devices now are ${Object.keys(brothers)}`)
      }
    } break;
    default:
      console.error(`[discovery] unknown message ${type}`);
  };
});

const sendBonjour = () => {
	sendMessage(Messages.Bonjour, {
    cpuScore: getCpuScore(),
    transcoderPort: CONFIG.Transcoder.Port
  });
};

const sendMessage = (type, payload = null) => {
	const message = Buffer.from(JSON.stringify({
    type,
    pid: process.pid,
    payload: payload || {},
  }));

  for (const addr of getBroadcastAddresses()) {
    server.send(message, 0, message.length, CONFIG.Discovery.Port, addr)
  }
};

const getCpuScore = () => {
  return os.cpus().reduce((acc, cur) => acc + cur.speed, 0);
};

const getBroadcastAddresses = () => {
	const result = [];
	const interfaces = os.networkInterfaces();

	for (const i in interfaces) {
		for (const data of interfaces[i]) {
			if (data.family !== 'IPv4') continue;
			if (data.address === '127.0.0.1') continue;
			const address = data.address.split('.').map(e => parseInt(e));
			const netmask = data.netmask.split('.').map(e => parseInt(e));
			result.push(address.map((e, i) => (~netmask[i] & 0xff) | e).join('.'))
		}
	}

	return result;
}

const getLocalAddresses = () => {
	const result = [];
	const interfaces = os.networkInterfaces();

	for (const i in interfaces) {
		for (const data of interfaces[i]) {
			if (data.family !== 'IPv4') continue;
			if (data.address === '127.0.0.1') continue;
			result.push(data.address)
		}
	}

	return result;
}
