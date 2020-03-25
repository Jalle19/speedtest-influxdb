# speedtest-influxdb

InfluxDB integration for the official Speedtest CLI

## Installation

* Install the official Speedtest CLI
* Run `npm install`

## Usage

```
INFLUXDB_HOST=localhost INFLUXDB_DATABASE=speedtest INFLUXDB_USERNAME=speedtest INFLUXDB_PASSWORD=speedtest node speedtest-influxdb.js
```

You can optionally choose a specific server to test against by specifying `SPEEDTEST_SERVER_ID=xxx`.

## License

GPL 3 or later
