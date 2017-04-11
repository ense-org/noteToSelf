import React from 'react'
import Svg,{
  Circle, Ellipse, G, LinearGradient, RadialGradient,
  Line, Path, Polygon, Polyline, Rect, Symbol, Use,
  Defs, Stop
} from 'react-native-svg'

export class Logo extends React.Component {
	render() {
		return <Svg width={this.props.width || 139} height={this.props.height || 140} viewBox="119 457 151 104">
			<Path d="M269.352795,492.627361 C242.242744,484.752297 222.369241,450.408268 193.639068,458.830211 C164.908895,467.361531 147.195555,517.455687 119.221439,526.205758 L119.221439,526.205758 C146.33149,534.080822 169.769262,566.893589 195.90724,560.002908 C222.045217,553.112227 241.378679,501.377432 269.352795,492.627361" id="ense-active" stroke="none" fill={this.props.fill || '#FF4691'} fill-rule="evenodd" />
		</Svg>
	}
}
