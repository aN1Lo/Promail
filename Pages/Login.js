import React, { Component } from 'react';
import md5 from "react-native-md5";
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import dismissKeyboard from 'react-native-dismiss-keyboard';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';

import Button from '../Components/Button';
import Label from '../Components/Label';

import ListMail from './ListMail'

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false, loginHasFocus: false, passwdHasFocus: false
    };
  }

  getAuthToken = (login, passwd) => {
  	return fetch(`https://admin.appinmail.io/api/v1/experimental/promail/prepare_user_runtime_2?user_id=${login}&password_md5=${passwd}`,{
    	method: 'POST',
    	headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
    }).then((response) => response.json())
    .then((responseJson) => {
       	if (responseJson[0] == 'success'){
         	url = responseJson[1]['promail_url'];
         	token = responseJson[1]['access_token'];
          global.url = url;
          global.token = token;
          return ([ url, token])
        }
        else {
        	console.log('wrong passwd or login');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  loginIn = (url, action, data) => {
    return fetch(url+`/restapi.py?action_name=${action}&xml_data=${data}`,{
    	method: 'POST',
    	headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
    }).then((response) => response.json())
    .then((responseJson) => {
       	if (responseJson[0] == 'success'){
          sid = responseJson[1]['sid'];
         	global.sid = sid;
          return (sid)
        }
        else {
        	console.log('something wrong');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getListMail = (url, action, data, sid) => {
    return fetch(url+`/restapi.py?action_name=${action}&xml_data=${data}&sid=${sid}`,{
    	method: 'POST',
    	headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
    }).then((response) => response.json())
    .then((responseJson) => {
       	if (responseJson[0] == 'success'){
          listMail = responseJson[1];
          return (listMail)
        }
        else {
        	console.log('something wrong');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  onTestPress = () => {
    dismissKeyboard();
    this.setState({
      visible: true,

    });

    this.getAuthToken(this.state.login, md5.hex_md5(this.state.password)).then((ret) => {
      [url, token] = ret;
      this.loginIn(url, 'login', JSON.stringify({'login':this.state.login, 'token': token})).then( (sid) => {
        this.getListMail(url, 'eac_list',JSON.stringify({'mailbox': '@AppInMail'}), sid).then( (listMail ) =>{
          this.props.navigation.navigate('ListMail', { listings: listMail });
          this.setState({
            visible: false
          });
        });
      });
    });
  }

  render() {
    return (
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps={'always'}
          innerRef={ref => {this.scroll = ref}}
          style={styles.scroll}
          extraHeight={200}
          //enableOnAndroid={true}
          >
          <View style={{height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 60 }}>
            <Image source = {require('../Resources/welcome_message_head.png')}/>
          </View>
          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={this.state.loginHasFocus ? styles.textInput_focused : styles.textInput_unfocused}
              selectTextOnFocus={true}
              onBlur={ () => {this.setState({loginHasFocus: !this.state.loginHasFocus})}}
              onFocus={ () => {this.setState({loginHasFocus: !this.state.loginHasFocus})}}
              underlineColorAndroid={'transparent'}
              onChangeText={(text) => this.setState({
                  login: text,
              })}
              placeholder='Login / Email' />
          </View>
          <View style={{ marginBottom: 20 }}>
            <TextInput
              onBlur={ () => {this.setState({passwdHasFocus: !this.state.passwdHasFocus})}}
              onFocus={ () => {this.setState({passwdHasFocus: !this.state.passwdHasFocus})}}
              secureTextEntry={true}
              style={this.state.passwdHasFocus ? styles.textInput_focused : styles.textInput_unfocused}
              clearTextOnFocus={true}
              underlineColorAndroid={'transparent'}
              onChangeText={(text) => this.setState({
                  password: text,
              })}
              placeholder='Password'
            />
          </View>
          <View style={styles.footer}>
              <View style={{ marginBottom: 20 }}>
              <Button
                label="SIGN IN"
                styles={{button: styles.primaryButton, label: styles.buttonWhiteText}}
                onPress={() => this.onTestPress()}
              />
              </View>
              <View style={{ flex: 1 }}>
                <Spinner visible={this.state.visible} textStyle={{color: '#FFF'}} />
              </View>
              <View style={{ marginBottom: 20 }}>
                <Button
                  label="Forgot password?"
                  styles={{button: styles.buttonForgot, label: styles.label1}}
                  onPress={() => {Linking.openURL('https://admin.appinmail.io/login')}}
                />
              </View>
          </View>
        </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      padding: 30,
      flexDirection: 'column',
      backgroundColor: '#FFF',
      height: '100%'
   },
   buttonWhiteText: {
     fontSize: 20,
     color: '#FFF',
   },
   primaryButton: {
     backgroundColor: '#da0750',
     width: 160,
     borderRadius: 6
   },
   buttonForgot:{
     backgroundColor: '#FFF'
   },
   footer: {
     marginBottom: 10,
     alignItems: 'center',
     justifyContent: 'center'
   },
   label: {
     color: '#FFF',
     fontSize: 20
   },
   label1:{
     color: '#da0750',
     textDecorationLine: "underline",
     textDecorationStyle: "solid",
     textDecorationColor: "#da0750"
   },
   textInput_unfocused: {
     height: 60,
     fontSize: 20,
     borderBottomColor: '#f0f0f0',
     borderBottomWidth: 1
   },
   textInput_focused: {
     height: 60,
     fontSize: 20,
     borderBottomColor: '#da0750',
     borderBottomWidth: 1
   }
});
