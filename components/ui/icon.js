import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { createIconSet } from 'react-native-vector-icons'
import glyphMap from './enseicons'
import { colors } from '../../styles'
import { Animated } from 'react-native'


const BaseIcon = createIconSet(glyphMap, 'enseicons')

export const Icon = (props) => {

  let Component = props.onPress ? TouchableOpacity : View
	let optionals = {}
	if (props.hitSlop) {
		optionals.hitSlop = props.hitSlop
	}

  return(
    <Component onPress={props.onPress}
      style={props.wrapperStyle || {backgroundColor: 'transparent'}}
			{...optionals}
		>
      <BaseIcon
				style={props.style || {
					color: props.color || colors.gold
				}}
        size={props.size || 50}
        name={props.name}
      />
    </Component>
  )
}

export const AnimatedIcon = 
	Animated.createAnimatedComponent(BaseIcon)
