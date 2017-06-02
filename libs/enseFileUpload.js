import { EnseAPI } from '../libs/enseAPI'
import { AsyncStorage } from 'react-native'

const STORAGE_KEY = 'deviceSecretKey'

var enseFileUpload = new function () {
  var self = this

  this.init =  async function () {
    try {
      var value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value !== null){
        console.log('Recovered selection from disk: ' + value);
      } else {
        var newDeviceKey = await EnseAPI.registerDevice()
        AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(newDeviceKey))
        console.log('Initialized with no selection on disk.');
      }
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }
  }
}()

function randElem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateColorCode() {
  var colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
  return randElem(colors) + randElem(colors) + randElem(colors);
}

function serializeJSON(data) {
  return Object.keys(data).map(function (keyName) {
    return encodeURIComponent(keyName) + '=' + encodeURIComponent(data[keyName])
  }).join('&');
}

async function uploadNewEnseWithBlob(fileBlob) {
  const handle =  generateColorCode()
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  const deviceKey = JSON.parse(value)
  let formArray = {
    mimeType: "audio/aac",
    deviceKey: deviceKey,
    userAgent: 'noteToself',
    delayRelease: false,
    unlisted: true
  }
  const params = { 
    method: 'POST',
    headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
    body: serializeJSON(formArray)
  }
  fetch('https://api.ense.nyc/ense/' + handle, params)
  .then(response => response.json())
    .then(json => {
      if(json.tag == 'Nothing') {
        console.log("ERROR: Talk to Clyde")
      } else {
        console.log("SUCCESS")
        const mimetype = formArray.mimeType
        const uploadKey = json.contents.uploadKey
        const policyBundle = json.contents.policyBundle
        const callback = uploadedFileUrl()
        //uploadFile(fileBlob, mimetype, uploadKey, policyBundle, callback, progress)
        uploadFile(fileBlob, mimetype, uploadKey, policyBundle, callback)
      }
    }
  )
}

async function uploadedFileUrl() {
  console.log("callback")
}

//async function uploadFile(fileBlob, mimetype, uploadKey, policyBundle, callback, progress) {
function uploadFile(fileBlob, mimetype, uploadKey, policyBundle, callback) {
  let formArray = {
    key: uploadKey,
    acl: "public-read",
    ContentType: mimetype,
    AWSAccessKeyId: 'AKIAJGPMBNUIOKY2WMHA',
    Policy: policyBundle.policyDoc,
    Signature: policyBundle.signature,
    file: fileBlob
  }
//JK: switch to upload file in react
  const params = { 
    method: 'POST',
    headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
    body: formArray
  }
  console.log(params)
  fetch('https://s3.amazonaws.com/media.ense.nyc/', params)
  .then(response => console.log(response))
}



export { enseFileUpload, uploadNewEnseWithBlob }