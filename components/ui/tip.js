import React from 'react'
import { View, Animated, } from 'react-native'
import styles, { colors } from '../../styles'

class Tip extends React.Component {

	constructor(props) {
		super(props)

		this.animationProgress = new Animated.Value(
			props.visible ? 1: 0
		)

		this.showThenHide = this.showThenHide.bind(this)
		this.show = this.show.bind(this)
		this.hide = this.hide.bind(this)
	}

	render() {
		return <Animated.View style={[{
			backgroundColor: colors.midnight,
			padding: 12,
			flexDirection: 'row',
			flex: 0,
			alignSelf: 'center',
			justifyContent: 'center',
			borderRadius: 3,
			opacity: this.animationProgress,
			transform: [{translateY: this.animationProgress}]
			}, this.props.style]}>
			{this.props.children}
			<View
				style={[{backgroundColor: colors.midnight,
					width: 15, height: 15,
					position: 'absolute',
					bottom: -5,
					transform: [ {rotate: '45deg'} ],
					zIndex: -1,
					borderRadius: 3
				}, this.props.triangleStyle ]}
			/>
		</Animated.View>
	}

	showThenHide() {
		Animated.sequence([
			Animated.timing(this.animationProgress, {
				toValue: 0, duration: 0
			}),
			Animated.timing(this.animationProgress, {
				toValue: 1,
			}),
			Animated.delay(1000),
			Animated.timing(this.animationProgress, {
				toValue: 0,
			})
		]).start()
	}

	show(duration=1000) {
		Animated.timing(this.animationProgress, {
			toValue: 1,
			duration
		}).start()
	}

	hide(duration=1000) {
		Animated.timing(this.animationProgress, {
			toValue: 0,
			duration
		}).start()
	}
}

export default Tip
