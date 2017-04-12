import React, { Component } from 'react'
import { AppRegistry, View } from 'react-native'
import Push2Talk from './components/push2Talk'

class noteToSelf extends Component {

  render() {
    return (
     
      <View style={{
        flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
        <Push2Talk 
            disabled={false}
            onPush={() => {}}
            onRelease={() => {}}
            onCancel={() => {}}
            onDisabledPress={() => {}}
            width={60}
          />
        </View>
     
    )
  }

}

AppRegistry.registerComponent('noteToSelf', () => noteToSelf)