const { Socket } = require('phoenix-channels')
const socket = new Socket("ws://dlevs.me:4000/socket")
const player = require('play-sound')(opts = {})

const themeSound = () => {
  player.play('sound/q_theme.wav', err => {
    if (err) throw err
  })
}

const loopTheme = () => {
  themeSound()
  setTimeout(() => {
    loopTheme()
  }, 116000)
}

const jumpSound = () => {
  player.play('sound/jump.wav', err => {
    if (err) throw err
  })
}

const moveSound = () => {
  player.play('sound/crawl.wav', err => {
    if (err) throw err
  })
}

socket.connect()
const channel = socket.channel("room:lobby", {})
channel.join()
  .receive("ok", resp => {
    loopTheme()
    console.log("Joined successfully", resp)
  })
  .receive("error", resp => {
    console.log("Unable to join", resp)
  })

channel.push("jump", {body: 'juuuuuump'})

const noble = require('noble');
const serviceUuids = ['FFFF'];
const allowDuplicates = false;

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning(serviceUuids, allowDuplicates);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', peripheral => {
  connectAU(peripheral);
  peripheral.on('disconnect', error => {
    console.log('disconnect');
    connectAU(peripheral);
  });
});

const connectAU = ( peripheral => {
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
          moveSound();
          channel.push("move", {body: 'moooove'})
          setTimeout(() => {
            moveSound();
            channel.push("move", {body: 'moooove'})
          }, 200);
        });
        // to enable notify
        dCharacteristic.subscribe(error => {
          console.log('notification on');
        });

        const wCharacteristic = characteristics[0];
        console.log('discovered w characteristic');

        wCharacteristic.on('data', (data, isNotification) => {
          console.log('w is now: ', `${data.readUInt16BE(0)}%`);
          jumpSound();
          channel.push("jump", {body: 'juuuuuump'})
          setTimeout(() => {
            moveSound();
            channel.push("move", {body: 'moooove'})
          }, 100);
        });
        // to enable notify
        wCharacteristic.subscribe(error => {
          console.log('notification on');
        });
      });
    });
  });
});
