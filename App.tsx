import {StatusBar} from 'expo-status-bar';
import {View,Text,StyleSheet} from 'react-native';
export default function App(){return <View style={styles.container}><StatusBar style="dark"/><Text style={styles.title}>Attira</Text><Text>React Native · Expo · pnpm</Text></View>;}
const styles=StyleSheet.create({container:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#f7f1ee'},title:{fontSize:36,color:'#5c2336'}});
