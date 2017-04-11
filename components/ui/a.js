import React from 'react'
import {
  Text,
  Linking
} from 'react-native'
import styles, { colors } from '../../styles'

const A = (props) => {
  let otherProps = {}
  if (props.numberOfLines) {
    otherProps.numberOfLines = props.numberOfLines
  }
  return(
    <Text style={[styles.a, {
      textDecorationLine: 'underline',
      textDecorationColor: colors.gold,
      textDecorationStyle: 'solid',
      color: colors.gold,
    }, props.style ]}
      onPress={ props.href ? () => {
        Linking.openURL(props.href)
      } : props.onPress }
      underlayColor={colors.midnight}
      {...otherProps}
      >{props.children}</Text>
  )
}

export default A
