import {
    StyleSheet,
    Dimensions,
    StatusBar
} from 'react-native'


const dimensions = Dimensions.get('window')
export const SCALE = dimensions.scale
export const WIDTH = dimensions.width
export const HEIGHT = dimensions.height
export const TOP_BAR_HEIGHT = 64

export const colors = {
  midnight        : '#3B3447',
  xxDarkMidnight  : '#0E0D11',
  gold            : '#E5C466',
  xxDarkGold      : '#393119',
  pink            : '#FF4691',
  xxDarkPink      : '#401124',
  xDarkMidnight   : '#1D1923',
  xDarkGold       : '#726132',
  xDarkPink       : '#7F2248',
  darkMidnight    : '#2C2635',
  darkGold        : '#AB924C',
  darkPink        : '#BF346C',
  lightMidnight   : '#6C6675',
  lightGold       : '#EBD28C',
  lightPink       : '#FF74AC',
  xLightMidnight  : '#9D99A3',
  xLightGold      : '#F2E1B2',
  xLightPink      : '#FFA2C8',
  xxLightMidnight : '#CDCCD0',
  xxLightGold     : '#F8F0D8',
  xxLightPink     : '#FFD0E3',
  purple          : '#9D3C6C',
  red             : '#D9534F',
  green           : '#9DEB93',
  grey            : '#A3A0A9',
  xxDarkGrey      : '#28282A',
  xDarkGrey       : '#514F54',
  darkGrey        : '#7A777E',
  lightGrey       : '#BAB7BE',
  xLightGrey      : '#D1CFD4',
  xxLightGrey     : '#E7E7E9',
  black           : '#000000',
  white           : '#FFFFFF',
  limeGreen       : '#32CD32',
  lightGreen      : '#DCF5E8',
  orangeRed       : '#FF4500',
  lightRed        : '#EEB3B4',

  facebook        : '#3B5998',
  twitter         : '#00ACED',
  messages        : '#18DD1E'
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
		paddingTop: TOP_BAR_HEIGHT,
		alignItems: 'stretch'
  },
  topBar: {
			width: WIDTH,
      height: TOP_BAR_HEIGHT,
      backgroundColor: 'white',
  },
  topBarBottomBorder: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      backgroundColor: colors.lightGray
  },
  audioPlayerProgress: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      backgroundColor: colors.pink
  },
  text: {
      fontSize: 25,
      color: colors.midnight
  },
  span: {
      fontSize: 14,
      color: colors.gray
  },
  p: {
      fontSize: 18,
      color: colors.midnight
  },
  h1: {
      fontSize: 26,
      color: colors.midnight
  },
  enseLogo: {
    width: 290,
    height: 128,
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  link : {
    color : 'blue',
    textDecorationLine : 'underline',
    padding : 16
  },
  scrollView : {
    flex : 1,
    alignSelf: 'stretch',
    bottom : 0
  },
  recordWarning : {
    backgroundColor : 'red',
    alignSelf : 'stretch'
  },
  recordWarningText : {
    color : 'white',
    textAlign : 'center'
  },
  topHeader: {
      padding: 10,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
      overflow: 'hidden',
      position: 'absolute',
      width: WIDTH
      //height: (HEIGHT / 2)
  },
  topHeaderIcons: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },
  enseLogoWrap: {
    //position: 'absolute',
    width: WIDTH,
    alignItems:'center',
    justifyContent:'center',
    marginTop: 20
  },
  recordingButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.pink,
    paddingTop: 9,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 40
  },
  recordingButtonText: {
    color: colors.pink,
    marginTop: 1,
    marginLeft: 7
  },
  enseLogoPauseWrapper: {
    backgroundColor: 'rgba(52, 46, 62, .8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    bottom: 50,
    left: -40,
    right: -40,
    padding: 5,
    borderRadius: 7
  },
  enseLogoPauseText: {
      textAlign: 'center',
      fontSize: 20,
      color: 'white'
  },
  clearBufferText: {
      textAlign: 'center',
      fontSize: 20,
      color: colors.gold
  },

  formLabel: {
    fontSize: 18,
    color: colors.midnight,
    textAlign: 'right',
  },
  textInput: {
    height: 40,
    backgroundColor: '#F3F3F3',
    borderRadius: 3,
    fontSize: 20,
    color: colors.midnight,
    padding: 5
  }
});

export default styles

