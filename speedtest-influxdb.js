const child_process = require('child_process')
const Influx = require('influx')

getSpeedtestResult = async function () {
  const results = child_process.execSync('speedtest --accept-license --accept-gdpr -f json')

  return JSON.parse(results.toString('utf8'))
}

getSchemaDefinition = function () {
  return [
    {
      measurement: 'speedtest',
      fields: {
        'ping.jitter': Influx.FieldType.FLOAT,
        'ping.latency': Influx.FieldType.FLOAT,
        'download.bandwidth': Influx.FieldType.INTEGER,
        'download.bytes': Influx.FieldType.INTEGER,
        'download.elapsed': Influx.FieldType.INTEGER,
        'upload.bandwidth': Influx.FieldType.INTEGER,
        'upload.bytes': Influx.FieldType.INTEGER,
        'upload.elapsed': Influx.FieldType.INTEGER,
        'packetLoss': Influx.FieldType.FLOAT,
        'isp': Influx.FieldType.STRING,
        'interface.internalIp': Influx.FieldType.STRING,
        'interface.name': Influx.FieldType.STRING,
        'interface.macAddr': Influx.FieldType.STRING,
        'interface.isVpn': Influx.FieldType.BOOLEAN,
        'interface.externalIp': Influx.FieldType.STRING,
        'server.id': Influx.FieldType.INTEGER,
        'server.name': Influx.FieldType.STRING,
        'server.location': Influx.FieldType.STRING,
        'server.country': Influx.FieldType.STRING,
        'server.host': Influx.FieldType.STRING,
        'server.port': Influx.FieldType.INTEGER,
        'server.ip': Influx.FieldType.STRING,
        'result.id': Influx.FieldType.STRING,
        'result.url': Influx.FieldType.STRING,
      },
      tags: [
        'isp',
        'server.name',
        'server.location'
      ]
    }
  ]
}

createPoint = function (result) {
  return {
    measurement: 'speedtest',
    fields: {
      'ping.jitter': result.ping.jitter,
      'ping.latency': result.ping.latency,
      'download.bandwidth': result.download.bandwidth,
      'download.bytes': result.download.bytes,
      'download.elapsed': result.download.elapsed,
      'upload.bandwidth': result.upload.bandwidth,
      'upload.bytes': result.upload.bytes,
      'upload.elapsed': result.upload.elapsed,
      'packetLoss': result.packetLoss,
      'isp': result.isp,
      'interface.internalIp': result.interface.internalIp,
      'interface.name': result.interface.name,
      'interface.macAddr': result.interface.macAddr,
      'interface.isVpn': result.interface.isVpn,
      'interface.externalIp': result.interface.externalIp,
      'server.id': result.server.id,
      'server.name': result.server.name,
      'server.location': result.server.location,
      'server.country': result.server.country,
      'server.host': result.server.host,
      'server.port': result.server.port,
      'server.ip': result.server.ip,
      'result.id': result.result.id,
      'result.url': result.result.url,
    },
    tags: {
      isp: result.isp,
      'server.name': result.server.name,
      'server.location': result.server.location,
    }
  }
}

const app = async function () {
  const requiredEnvs = [
    'INFLUXDB_HOST',
    'INFLUXDB_DATABASE',
    'INFLUXDB_USERNAME',
    'INFLUXDB_PASSWORD',
  ]

  for (requiredEnv of requiredEnvs) {
    if (process.env[requiredEnv] === undefined) {
      console.error(`You must define the ${requiredEnv} environment variable`)
      process.exit(1)
    }
  }

  const influx = new Influx.InfluxDB({
    host: process.env.INFLUXDB_HOST,
    database: process.env.INFLUXDB_DATABASE,
    username: process.env.INFLUXDB_USERNAME,
    password: process.env.INFLUXDB_PASSWORD,
    schema: getSchemaDefinition(),
  })

  const databaseNames = await influx.getDatabaseNames()

  if (!databaseNames.includes(process.env.INFLUXDB_DATABASE)) {
    throw new Error(`The database "${process.env.INFLUXDB_DATABASE}" does not exist`)
  }

  const result = await getSpeedtestResult()

  influx.writePoints([createPoint(result)])
};

(async () => {
  await app();
})().catch(e => {
  console.error(e.message)
  process.exit(1)
})
