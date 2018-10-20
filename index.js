const { Socket } = require('phoenix-channels')

const socket = new Socket("ws://dlevs.me:4000/socket")

socket.connect()

// Now that you are connected, you can join channels with a topic:
const channel = socket.channel("room:lobby", {})
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

channel.push("jump", {body: 'juuuuuump'})

const noble = require('noble');
const serviceUuids = ['FFFF'];
const allowDuplicates = false;
let lastMove = 0;

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning(serviceUuids, allowDuplicates);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', peripheral => {
  peripheral.connect(error => {
    console.log(`connected to peripheral: ${peripheral.uuid}`);
    peripheral.discoverServices(['ffff'], (error, services) => {
      const dService = services[0];
      console.log('discovered d service');

      dService.discoverCharacteristics(null, (error, characteristics) => {
        const dCharacteristic = characteristics[1];
        console.log('discovered d characteristic');

        dCharacteristic.on('data', (data, isNotification) => {
          console.log('d is now: ', `${data.readUInt16BE(0)}%`);
          let thisMove = data.readUInt16BE(0);
          channel.push("move", {body: 'moooove'})
          lastMove = thisMove
        });
        // to enable notify
        dCharacteristic.subscribe(error => {
          console.log('notification on');
        });

        const wCharacteristic = characteristics[0];
        console.log('discovered w characteristic');

        wCharacteristic.on('data', (data, isNotification) => {
          console.log('w is now: ', `${data.readUInt16BE(0)}%`);
          let thisMove = data.readUInt16BE(0);
          channel.push("jump", {body: 'juuuuuump'})
          lastMove = thisMove
        });
        // to enable notify
        wCharacteristic.subscribe(error => {
          console.log('notification on');
        });
      });
    });
  });
});
