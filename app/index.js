import React, { Component } from 'react'
import {
  AppRegistry,
  AsyncStorage,
  Image,
  ListView,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Platform,
  PermissionsAndroid
} from 'react-native'
import {  StyleProvider, Container, Content, Header, Footer, Title, List, 
          ListItem, Text, Icon, Badge, Left, Body, Right, Switch  } from 'native-base'
import getTheme from '../native-base-theme/components';  
import customTheme from '../styles/customTheme';
import lodash from 'lodash'
import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import uuid from 'react-native-uuid'
import Push2Talk from '../components/push2Talk'
import { enseFileUpload } from './../libs/enseFileUpload'


var STORAGE_KEY = 'storedRecordings'

class noteToSelf extends Component {
  state = {
      currentTime: 0.0,
      recording: false,
      playState: 'stopped',
      stoppedRecording: false,
      finished: false,
      hasPermission: undefined,
      storedRecordings: [],
      holdingRecordButton: false 
    };

    async _loadInitialState() {
      enseFileUpload.init()
      try {
        var value = await AsyncStorage.getItem(STORAGE_KEY);

        if (value !== null){
          this.setState({storedRecordings: JSON.parse(value)});
          //console.log('Recovered selection from disk: ' + JSON.parse(value));
        } else {
          console.log('Initialized with no selection on disk.');
        }
      } catch (error) {
        console.log('AsyncStorage error: ' + error.message);
      }
    };

    prepareRecordingPath(){

      const audioPath = AudioUtils.DocumentDirectoryPath + '/' + uuid.v1() + '.aac'

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

        this.prepareRecordingPath();

        //initliaze file upload
        //enseFileUpload.init();

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

    async _play(filepath) {

      var filepath = filepath.replace('file://', '')

      if (this.state.recording) {
        await this._stop();
      }

      this.setState({ 
        playState: 'playing'
      })

      // These timeouts are a hacky workaround for some issues with react-native-sound.
      // See https://github.com/zmxv/react-native-sound/issues/89.
      setTimeout(() => {
        var sound = new Sound(filepath, '', (error) => {
          if (error) {
            console.log('failed to load the sound', error);
          }
        });

        setTimeout(() => {
          sound.play((success) => {
            if (success) {
              console.log('successfully finished playing');
              this.setState({ 
                playState: 'stopped'
              })
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
        this.prepareRecordingPath();
      }

      this.setState({recording: true});

      try {
        const filePath = await AudioRecorder.startRecording();
      } catch (error) {
        console.error(error);
      }
    }


    async _upload() {
      console.log("upload")
    }


    _finishRecording(didSucceed, filePath) {
      this.setState({ finished: didSucceed });
      //save to async storage here
      this._saveRecording(filePath)
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

    _addToAsyncStorage(array) {
      //we call this functoin whenever we manipulate
      //the stored recordings array
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(array), () => {
        this.setState({ 
          storedRecordings: array
        })
      });      

    }

    _saveRecording(filePath) {
      const UUID = uuid.v1()
      const title = `#${this.randomStr(4)} ${this.generateColorCode()} `
      const filename = UUID + '.aac'

      var newRecording = {
        title: title,
        filename: filename,
        UUID: UUID,
        filePath: filePath
      };

      var newRecordingArray = this.state.storedRecordings.slice()
      newRecordingArray.push(newRecording)
      this._addToAsyncStorage(newRecordingArray) 
    }
    
    _deleteRecording(UUID) {
      const array = this.state.storedRecordings.slice()
      //JK: need help from rob
      console.log(this.state.storedRecordings)
      var newRecordingArray = _.reject(array, sub => sub[1] === UUID)
      this._addToAsyncStorage(newRecordingArray)
    }

    _renderRecorderButton() {
      //see if on mobile and if so redirect
        var enseLogo
        if (Platform.OS == 'ios') {
            enseLogo =
               <Push2Talk 
                disabled={false}
                onPush={() => {this._record(), this.state.recording }}
                onRelease={() => {this._stop()}}
                onCancel={() => {}}
                onDisabledPress={() => {}}
                width={60}
              />
        } else if (Platform.OS == 'android') {
          enseLogo = 
            <TouchableWithoutFeedback
              onPressIn={() => {this._record(), this.state.recording }}
              onPressOut={() => {this._stop()}}
            >
              <Image 
                style={{width: 50, height: 50}}
                source={require('../assets/ense_logo.png')} 
              />
            </TouchableWithoutFeedback>
        }

        return (
          <Footer>{enseLogo}</Footer>
        )

    }

  render() {

    const playState = this.state.playState  === 'playing' ? 'pause' : 'play'

    return (
      <StyleProvider style={getTheme(customTheme)}>    
       <Container>
        <Header>
          <Title>Note To Self</Title>
        </Header>
        <Content>
          <List>
            <List dataArray={this.state.storedRecordings.reverse()}
              renderRow={(item) =>
                <ListItem icon>
                  <Left>
                    <Icon name="trash" onPress={() => this._deleteRecording(item.UUID) } />
                    <Icon name={playState}  onPress={() => this._play(item.filePath) } />
                  </Left>
                  <Body>
                    <Text>{item.title}</Text>
                  </Body>
                  <Right>
                    <Icon name="share" onPress={() => this._upload(item) } />
                  </Right>
                </ListItem>
              }>
              </List>
            </List>
          </Content>
          {this._renderRecorderButton()}
        </Container>
      </StyleProvider> 
    )
  }

}

export default noteToSelf
//AppRegistry.registerComponent('noteToSelf', () => noteToSelf)