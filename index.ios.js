  import React, { Component } from 'react'
import {
  AppRegistry,
  AsyncStorage,
  ListView,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
  PermissionsAndroid,
} from 'react-native'
import Push2Talk from './components/push2Talk'
import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import uuid from 'react-native-uuid'
import { enseFileUpload, tagEnseWithHandle } from './components/enseFileUpload'

var STORAGE_KEY = 'storedRecordings'

const dataSource = new ListView.DataSource({
    rowHasChanged: (r1, r2) => r1.id !== r2.id
});

class noteToSelf extends Component {
  state = {
      currentTime: 0.0,
      recording: false,
      stoppedRecording: false,
      finished: false,
      hasPermission: undefined,
      storedRecordings: []
    };

    async _loadInitialState() {

      try {
        var value = await AsyncStorage.getItem(STORAGE_KEY);

        if (value !== null){
          console.log(value)
          this.setState({storedRecordings: JSON.parse(value)});
          console.log('Recovered selection from disk: ' + JSON.parse(value));
        } else {
          console.log('Initialized with no selection on disk.');
        }
      } catch (error) {
        console.log('AsyncStorage error: ' + error.message);
      }
    };

    prepareRecordingPath(){
      //JK hack to get seperate audio files
      const audioPath = AudioUtils.DocumentDirectoryPath + '/' + uuid.v1() + 'test.aac'
      //JK hack to get seperate audio files
      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000,
      });
    }

    componentDidMount() {
      this._loadInitialState().done();
      this._checkPermission().then((hasPermission) => {
        this.setState({ hasPermission });

        if (!hasPermission) return;

        //initliaze file upload
        //enseFileUpload.init();

        //do things for recording
        this.prepareRecordingPath(this.state.audioPath);

        AudioRecorder.onProgress = (data) => {
          this.setState({currentTime: Math.floor(data.currentTime)});
        };

        AudioRecorder.onFinished = (data) => {
          // Android callback comes in the form of a promise instead.
          if (Platform.OS === 'ios') {
            this._finishRecording(data.status === "OK", data.audioFileURL);
          }
        };
      });
    }

    componentDidUpdate() {
      //console.log(this.state.storedRecordings)
    }

    _checkPermission() {
      if (Platform.OS !== 'android') {
        return Promise.resolve(true);
      }

      const rationale = {
        'title': 'Microphone Permission',
        'message': 'AudioExample needs access to your microphone so you can record audio.'
      };

      return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
        .then((result) => {
          console.log('Permission result:', result);
          return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
        });
    }

    async _pause() {
      if (!this.state.recording) {
        console.warn('Can\'t pause, not recording!');
        return;
      }

      this.setState({stoppedRecording: true, recording: false});

      try {
        const filePath = await AudioRecorder.pauseRecording();

        // Pause is currently equivalent to stop on Android.
        if (Platform.OS === 'android') {
          this._finishRecording(true, filePath);
        }
      } catch (error) {
        console.error(error);
      }
    }

    async _stop() {
      if (!this.state.recording) {
        console.warn('Can\'t stop, not recording!');
        return;
      }

      this.setState({stoppedRecording: true, recording: false});

      try {
        const filePath = await AudioRecorder.stopRecording();

        if (Platform.OS === 'android') {
          this._finishRecording(true, filePath);
        }
        return filePath;
      } catch (error) {
        console.error(error);
      }
    }

    async _play() {
      if (this.state.recording) {
        await this._stop();
      }

      // These timeouts are a hacky workaround for some issues with react-native-sound.
      // See https://github.com/zmxv/react-native-sound/issues/89.
      setTimeout(() => {
        var sound = new Sound(this.state.audioPath, '', (error) => {
          if (error) {
            console.log('failed to load the sound', error);
          }
        });

        setTimeout(() => {
          sound.play((success) => {
            if (success) {
              console.log('successfully finished playing');
            } else {
              console.log('playback failed due to audio decoding errors');
            }
          });
        }, 100);
      }, 100);
    }

    async _record() {
      if (this.state.recording) {
        console.warn('Already recording!');
        return;
      }

      if (!this.state.hasPermission) {
        console.warn('Can\'t record, no permission granted!');
        return;
      }

      if(this.state.stoppedRecording){
        this.prepareRecordingPath(this.state.audioPath);
      }

      this.setState({recording: true});

      try {
        const filePath = await AudioRecorder.startRecording();
      } catch (error) {
        console.error(error);
      }
    }

    randomStr (length) {
      var i
      var charset = '0123456789'
      var randstr = ''
      for (i = 0; i < length; i++) {
        randstr = randstr + charset[Math.floor(Math.random() * charset.length)]
      }
      return randstr
    }

   randElem (arr) {
      return arr[Math.floor(Math.random() * arr.length)]
    }


    generateColorCode () {
      var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
      return this.randElem(colors)
    }

    _addToAsyncStorage(filePath) {
      const UUID = uuid.v1()
      const recordingTitle = `#${this.randomStr(4)} ${this.generateColorCode()} `

      var newRecording = [
        recordingTitle: recordingTitle,
        UUID: UUID,
        filePath: filePath
      ];

      var newRecordingArray = this.state.storedRecordings.slice()
      newRecordingArray.push(newRecording)

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newRecordingArray), () => {
        this.setState({ 
          storedRecordings: newRecordingArray
        })
      });      

    }

    _finishRecording(didSucceed, filePath) {
      this.setState({ finished: didSucceed });
      //save to async storage here
      this._addToAsyncStorage(filePath)
      //console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
    }

  render() {

    const styles = StyleSheet.create({
      headerContainer: {
        flex: 1,
        padding: 18,
        justifyContent: 'center',
        backgroundColor: '#EAEAEA',
      },
      headerText: {
        fontSize: 13,
      },
      rowContainer: {
        flex: 1,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
      },
      rowText: {
        marginLeft: 12,
        fontSize: 16,
      },
      separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#8E8E8E',
      }
    })

    const SectionHeader = () => (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>note to self</Text>
      </View>
    )


    const Row = (props) => (
      <View style={styles.separator}></View>
    )

    const Seperator = () => (
      <View style={styles.separator}></View>
    )


    return (
     
      <View style={{
        flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
        <ListView
          dataSource={dataSource.cloneWithRows(this.state.storedRecordings)}
          renderRow={(data) => <View style = {styles.rowContainer}><Text style = {styles.rowText}>{data[0]}</Text></View>}
          renderHeader={() => <SectionHeader />}
          renderSeparator={() => <Seperator />}
        />
        <Push2Talk 
            disabled={false}
            onPush={() => {this._record(), this.state.recording }}
            onRelease={() => {this._stop()}}
            onCancel={() => {}}
            onDisabledPress={() => {}}
            width={60}
          />
        </View>
     
    )
  }

}

AppRegistry.registerComponent('noteToSelf', () => noteToSelf)