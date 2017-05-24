import { EnseAPI } from '../components/enseAPI'
import { AsyncStorage } from 'react-native'

//adapted/cleaned up from EnseWidget
//only file upload stuff is in here
var enseFileUpload = new function () {

  var self = this
  var STORAGE_KEY = 'deviceSecretKey'

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

export { enseFileUpload }