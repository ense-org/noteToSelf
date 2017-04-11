import React from 'react'
import {
	AppRegistry, View,
	Animated,
	TouchableOpacity,
	PanResponder, Modal
} from 'react-native'
import Animation from 'lottie-react-native'
//import DeviceInfo from 'react-native-device-info'
import { StaggeredMotion, Motion, spring } from 'react-motion'
import LinearGradient from 'react-native-linear-gradient'

import animSource from './data.json'
import styles, { HEIGHT, WIDTH, colors } from '../styles'
import { Logo } from './vectors'
import UI from './ui'

//const IPHONE_7_PLUS = 'iPhone 7 Plus'
//const DEVICE_MODEL = DeviceInfo.getModel()

let ANIM_1  = animSource
let ANIM_2 = JSON.parse(JSON.stringify(animSource))
let ANIM_3 = JSON.parse(JSON.stringify(animSource))

const ICON_SIZE = 70
const ICON_RELEASE_ZONE = 5000

//const AnimatedModal = Animated.createAnimatedComponent(Modal)

// modify json fill manually
ANIM_2.layers[0].shapes[0].it[1].c.k = [255/255,70/255,145/255,0.9]
ANIM_3.layers[0].shapes[0].it[1].c.k = [235/255,189/255,57/255,0.9]

const ANIM_WIDTH = 139 * 1
const ANIM_HEIGHT = 140 * 1
const animationStyle = {
	width: ANIM_WIDTH, height: ANIM_HEIGHT,
	position: 'absolute',
	top: 0, left: 0,
}

const QUEUE_SIZE = 20

class Push2Talk extends React.Component {

constructor(props) {
	super()

	this.data = {
		average: 0,
		variance: 0,
		stddev: 0
	}

	this.queue = []

	this.progress1 = new Animated.Value(0)
	this.progress2 = new Animated.Value(0)
	this.progress3 = new Animated.Value(0)
	this.modalY = new Animated.Value(0)


	this.modalY.addListener((v) => console.log(v))

	this.ensePressPan = new Animated.ValueXY({x: WIDTH, y: HEIGHT})
	this.iconLockPosition = new Animated.ValueXY({x: WIDTH, y: HEIGHT})
	this.iconCancelPosition = new Animated.ValueXY({x: WIDTH, y: HEIGHT})

	this.deltaCancelX_ = Animated.add(this.iconCancelPosition.x,
		Animated.multiply(this.ensePressPan.x, new Animated.Value(-1)))
	this.deltaCancelY_ = Animated.add(this.iconCancelPosition.y,
		Animated.multiply(this.ensePressPan.y, new Animated.Value(-1)))
	this.deltaCancelX = Animated.multiply(this.deltaCancelX_, this.deltaCancelX_)
	this.deltaCancelY = Animated.multiply(this.deltaCancelY_, this.deltaCancelY_)
	this.deltaCancel = Animated.add(this.deltaCancelX, this.deltaCancelY)

	this.deltaLockX_ = Animated.add(this.iconLockPosition.x,
		Animated.multiply(this.ensePressPan.x, new Animated.Value(-1)))
	this.deltaLockY_ = Animated.add(this.iconLockPosition.y,
		Animated.multiply(this.ensePressPan.y, new Animated.Value(-1)))
	this.deltaLockX = Animated.multiply(this.deltaLockX_, this.deltaLockX_)
	this.deltaLockY = Animated.multiply(this.deltaLockY_, this.deltaLockY_)
	this.deltaLock = Animated.add(this.deltaLockX, this.deltaLockY)

	this.lockAnimationProgress = new Animated.Value(0)

	this.iconCancelPositionValue = { x: WIDTH, y: HEIGHT }
	this.iconCancelPosition.addListener((value) => {
		this.iconCancelPositionValue = value
	})
	this.iconLockPositionValue = { x: WIDTH, y: HEIGHT }
	this.iconLockPosition.addListener((value) => {
		this.iconLockPositionValue = value
	})

	this.onAmplitudeUpdate = this.onAmplitudeUpdate.bind(this)
	this.onCancel = this.onCancel.bind(this)

	this.state = {
		z: 0,
		pressedIn: false,
		buttonLayout: {
			height: 0,
			width: 0,
			x: 0, y: 0
		},
	}

	this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
		    onMoveShouldSetPanResponder: (evt, gestureState) => true,
		    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
			onShouldBlockNativeResponder: (evt, gestureState) => true,
			onPanResponderMove: Animated.event([
				{ nativeEvent: {
						pageX: this.ensePressPan.x,
						pageY: this.ensePressPan.y,
				}}
			]),
			onPanResponderGrant: this.onPanResponderGrant.bind(this),
			onPanResponderRelease: this.onPanResponderRelease.bind(this),

			// Another component has become the responder, so this gesture
			// should be cancelled
			onPanResponderTerminate: (evt, gestureState) => {},
		})
	}

	onPanResponderGrant({nativeEvent: {pageX, pageY}}, gestureState) {
		if (!this.props.disabled) {
			this.cancelTimeout = false
			this.showModal()
			this.timeoutToClear = setTimeout(() => {
				if (this.cancelTimeout) {
					this.setState({pressedIn: false, locked: false})
					this.closeModal()
					//this._holdToRecordTip.showThenHide()
					return
				}
				this.props.onPush()
				this.ensePressPan.setValue({ x: pageX, y: pageY })
				this.setState({pressedIn: true, locked: false})
				//this._holdToRecordTip.hide(50)
				//this.releaseTipTimeout = setTimeout(
				//	this._releaseTip.show, 0)
				this.pushTime = Date.now()
			}, 150)
		}
	}

	// The user has released all touches while this view is the
	// responder. This typically means a gesture has succeeded
	onPanResponderRelease(evt, gestureState) {
		this.cancelTimeout = true
		if (this.props.disabled) {
			this.props.onDisabledPress()
			return
		}

		if (this.releaseTipTimeout) {
			clearTimeout(this.releaseTipTimeout)
		}

		if (this.state.pressedIn) {
			const gestureX = evt.nativeEvent.pageX
			const gestureY = evt.nativeEvent.pageY
			const cancelX = this.iconCancelPositionValue.x
			const cancelY = this.iconCancelPositionValue.y
			const lockX   = this.iconLockPositionValue.x
			const lockY   = this.iconLockPositionValue.y

			if (Math.abs(gestureX - cancelX) < 60 && 
				Math.abs(gestureY - cancelY) < 60) {
				this.onCancel() } else {
			/*} else if (Math.abs(gestureX - lockX) < 60 && 
				Math.abs(gestureY - lockY) < 60) {
				this.setState({ locked: true })
			} else {*/
				this.props.onRelease()
				this.closeModal()
			}
			//this._releaseTip.hide(50)
		}
	}

	onCancel() {
		this.props.onCancel()
		this.closeModal()
	}

	showModal() {
		//this.modalY.setValue(0)
		Animated.spring(this.modalY, {
				toValue: 1,
				// TODO: Must wait until pan responder
				// native driver is supported
				//useNativeDriver: true
		}).start()
	}

	closeModal() {
		Animated.spring(this.modalY, {
				toValue: 0,
				// TODO: Must wait until pan responder
				// native driver is supported
				//useNativeDriver: true
		}).start()
		this.setState({pressedIn: false})
	}

	_interpModalY(outputRange) {
		return this.modalY.interpolate({
			inputRange: [0, 1],
			outputRange: outputRange
		})
	}

		

  render() {

    return (
		<View>
			<Modal
			visible={this.state.pressedIn}
			transparent={true}
			animationType='fade'
			style={{
				top: 0, left: 0, right: 0, bottom: 0,
				//backgroundColor: 'rgba(58,51,71,0.98)',
			}}>
				<LinearGradient
					colors={[
						'rgba(241, 241, 241, 0.00)',
						'rgba(241, 241, 241, 0.00)',
						'rgba(241, 241, 241, 0.00)',
						'rgba(241, 241, 241, 1)',
					]} style={{ flex: 1 }}>
					<TouchableOpacity style={{flex: 1}}
						onPress={() => {
							if (this.state.locked) {
								this.props.onRelease()
								this.closeModal()
							}
						}}>
						<Animated.View style={{
								position: 'absolute',
								top: 0, left: 0,
								transform: [
										{translateX: this._interpModalY([this.state.buttonLayout.x, WIDTH/2 - ANIM_WIDTH / 2])},
										{translateY: this._interpModalY([this.state.buttonLayout.y, HEIGHT/8*7 - ANIM_HEIGHT / 2])},
										{scale: this._interpModalY([this.state.buttonLayout.width / ANIM_WIDTH, 1])}
									]
							}}>
							<Animation style={animationStyle} source={ANIM_3} progress={this.progress3.interpolate({
								inputRange: [-2, 0, 2, 25], outputRange: [0, 0, 1, 1]})} />
							<Animation style={animationStyle} source={ANIM_2} progress={this.progress2.interpolate({
								inputRange: [-2, 0, 2, 25], outputRange: [0, 0, 1, 1]})} />
							<Animation style={animationStyle} source={ANIM_1} progress={this.progress1.interpolate({
								inputRange: [-2, 0, 2, 25], outputRange: [0, 0, 1, 1]})} />
						</Animated.View>
						{this._renderCancelButton()}
					</TouchableOpacity>
				</LinearGradient>
			</Modal>

			<Animated.View
				style={{
					opacity: this._interpModalY([1, 0]),
					transform: [
						{translateX: this._interpModalY([0, WIDTH / 2 - this.state.buttonLayout.width / 2 - this.state.buttonLayout.x])},
						{translateY: this._interpModalY([0, HEIGHT * 3/4 - this.state.buttonLayout.height / 2 - this.state.buttonLayout.y])},
						{scale: this._interpModalY([1, ANIM_WIDTH / this.state.buttonLayout.width ])}
					]
				}}
				{...this._panResponder.panHandlers} >
					<View ref={(r) => this._button = r }>
						<Logo
							fill={this.props.overrideColor}
							width={this.props.width || 139}
							height={this.props.width ? (this.props.width / 139 * 140) : 140}
						/>
					</View>
			</Animated.View>

			{//this._renderToolTip()
			}

		</View>
    )
  }

  _renderToolTip() {
		return <AnimatedModal
			visible={true}
			style={{
				top: 0, left: 0, right: 0, bottom: 0,
				alignItems: 'center',
			}}
			transparent={true}
			pointerEvents='none'
		>
			<UI.Tip key={1} visible={false} ref={(r) => {this._holdToRecordTip = r}}
				style={{
					position: 'absolute',
					top: this.state.buttonLayout.y - this.state.buttonLayout.height / 2 - 15
				}}>
				<UI.P style={{color: 'white'}}> Hold down to record.</UI.P>
			</UI.Tip>

			<UI.Tip  key={2} visible={false} ref={(r) => {this._releaseTip = r}}
				style={{
					position: 'absolute',
					top: HEIGHT/8*7 - ANIM_HEIGHT / 2 - 25
				}}>
				<UI.P style={{color: 'white'}}>Release To Publish</UI.P>
			</UI.Tip>
		</AnimatedModal>
	} 

  _renderCancelButton() {
    return <Animated.View
				style={{
		            padding: 5,
					position: 'absolute',
					top: HEIGHT * 7/8 - ICON_SIZE / 2,
					left: WIDTH * 1/8 - ICON_SIZE / 2,
		            height: ICON_SIZE,
		            width: ICON_SIZE,
		            justifyContent: 'center',
		            alignItems: 'center',
									transform: [
										{ translateX: this._interpModalY([-50, 0])},
										{ translateY: this._interpModalY([50, 0])},
										{
											scale: this.deltaCancel.interpolate({
												inputRange: [(ICON_RELEASE_ZONE)^2*(-1)-1, (ICON_RELEASE_ZONE)^2*-1, 0 - ICON_SIZE, 0, ICON_SIZE, (ICON_RELEASE_ZONE)^2, ICON_RELEASE_ZONE^2+1],
												outputRange: [1, 1, 1.5, 1.5, 1.5, 1, 1]
											})
										}
									],
							}}
							onLayout={({nativeEvent: { layout: {x, y}}}) => {
								this.iconCancelPosition.setValue({
									x: x + ICON_SIZE / 2,
									y: y + ICON_SIZE / 2
								})
							}}>
		        <TouchableOpacity onPress={this.onCancel}>
		          <View style={{justifyContent: 'center', alignItems: 'center'}}>
		            {/*<UI.Icon name='x' size={ICON_SIZE / 2} color={colors.midnight}/>*/}
		            <UI.P style={{color: colors.midnight, backgroundColor: 'transparent'}}>Cancel</UI.P>
		          </View>
		        </TouchableOpacity>
			</Animated.View>
  }

	componentDidMount() {
		this.frameRequest = requestAnimationFrame(() => {
			this._button.measure((x, y, width, height, pageX, pageY) => {
				this.setState({buttonLayout: {
				width, height,
					x: pageX, y: pageY
				}})
			})
		})
	}

	componentWillUnmount() {
		if (this.frameRequest) {
			cancelAnimationFrame(this.frameRequest)
		}
		if (this.releaseTipTimeout) {
			clearTimeout(this.releaseTipTimeout)
		}
		if (this.timeoutToClear) {
			clearTimeout(this.timeoutToClear)
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.locked && this.state.locked) {
		  Animated.spring(this.lockAnimationProgress, {
		    toValue: 1
		  }).start()
		} else if (prevState.locked && !this.state.locked){
		  this.lockAnimationProgress.setValue(0)
		}
	}

	onAmplitudeUpdate(amplitude) {
		/*this.queue.push(amplitude)
		let old	, z
		if (this.queue.length > QUEUE_SIZE) {
			old  = this.queue.shift()
			let oldavg = this.data.average
			let newavg = oldavg + (amplitude - old) / this.queue.length
			this.data.average = newavg
			this.data.variance += (amplitude - old) * (amplitude - newavg + old - oldavg) / (this.queue.length - 1)
			this.data.stddev = Math.sqrt(Math.abs(this.data.variance))
			z = (amplitude - this.data.average) / this.data.stddev
		} else {
		}*/
		z = amplitude

		Animated.timing(this.progress1, {
			toValue: z,
			duration: 39
		}).start()

		Animated.timing(this.progress2, {
				toValue: this.progress1,
				duration: 55 + 10 + 10
			}).start();

		Animated.timing(this.progress3, {
				toValue: this.progress1,
				duration: 70 + 10 + 10
			}).start();

	}

	
}

export default Push2Talk
