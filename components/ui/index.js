import React from 'react'
import { Text } from 'react-native'
import styles, { colors } from '../../styles'

import { Icon, AnimatedIcon } from './icon'
import Button from './button'
import A from './a'
import Tip from './tip'

const Span = props =>
  <Text style={[styles.span, (props.style || {})]}
    numberOfLines={props.numberOfLines}
  >
    {props.children}
  </Text>

const P = props =>
  <Text style={[styles.p, props.style ? props.style : {}]}
    numberOfLines={props.numberOfLines}
  >
    {props.children}
  </Text>

const B = props =>
  <Text style={[styles.p, styles.b, props.style ? props.style : {}]}
    numberOfLines={props.numberOfLines}
  >
    {props.children}
  </Text>

const H1 = props =>
  <Text style={[styles.h1, props.style ? props.style : {}]}
    numberOfLines={props.numberOfLines}
  >
    {props.children}
  </Text>


export default {
	Icon, AnimatedIcon,
  Button,
  P, H1,
	A, B, Span,
	Tip
}
