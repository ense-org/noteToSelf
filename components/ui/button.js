import React from 'react'
import {
  View,
  TouchableOpacity,
  Text
} from 'react-native'
import styles, { colors } from '../../styles'

const Button = (props) => {

  let Component = props.onPress ?
    TouchableOpacity : View

  return(
    <Component style={[{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: props.color || colors.midnight,
        borderRadius: 3
      }, props.wrapperStyle ?
        props.wrapperStyle : {}
      ]}
      onPress={props.onPress}
      underlayColor={colors.midnight}
      >
      {
        props.children ? props.children : <Text
          style={[styles.text, {
            color: props.textColor || colors.midnight,
            fontSize: 17
          }]}
          >
        {props.text || 'text'}</Text>
      }
      </Component>
  )
}

export default Button
