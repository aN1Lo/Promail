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
  Linking,
  AsyncStorage,
  AppState
} from 'react-native';

import Button from '../Components/Button';
import Label from '../Components/Label';

import ListMail from './ListMail';

export function getAuthToken(login, passwd) {
  return fetch(`https://admin.appinmail.io/api/v1/experimental/promail/prepare_user_runtime_2?user_id=${login}&password_md5=${passwd}`,{
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
  }).then((response) => response.json())
  .then((responseJson) => {
      if (responseJson[0] == 'success'){
        url = responseJson[1]['promail_url'];
        token = responseJson[1]['access_token'];
        return ([ url, token])
      }
      else {
        console.log('wrong passwd or login');
        console.log(responseJson[1]);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

export function loginIn(url, action, data) {
  return fetch(url+`/restapi.py?action_name=${action}&xml_data=${data}`,{
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
  }).then((response) => response.json())
  .then((responseJson) => {
      if (responseJson[0] == 'success'){
        sid = responseJson[1]['sid'];
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

export function getListMail(url, action, data, sid) {
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

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loginHasFocus: false,
      passwdHasFocus: false,
      appState: AppState.currentState,
    };
  }

  componentDidMount() {
    global.start = new Date();
    AppState.addEventListener('change', this._handleAppStateChange);
    try {
      AsyncStorage.getItem('login').then(login => {
        if (login !== null){
          this.setState({
            visible: true,
          });
          AsyncStorage.getItem('passwd_md5').then(passwd_md5 => {
            getAuthToken(login, passwd_md5).then((ret) => {
              [url, token] = ret;
              loginIn(url, 'login', JSON.stringify({'login':this.state.login, 'token': token})).then( (sid) => {
                getListMail(url, 'eac_list',JSON.stringify({'mailbox': '@AppInMail'}), sid).then( (listMail ) =>{
                  global.listMail=listMail;
                  this.props.navigation.navigate('ListMail');
                  this.setState({
                    visible: false,
                  });
                });
              });
            });
          })
        }
      })
    } catch (error) {
      console.log("Error retrieving data: " + error);
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      try {
        AsyncStorage.getItem('login').then(login => {
          console.log(login);
          let end = new Date();
          let elapsed = end.getTime() - global.start.getTime();
          console.log(elapsed);
          if (login !== null && elapsed>=270000){
            global.start = end;
            this.setState({
              visible: true,
            });
            AsyncStorage.getItem('passwd_md5').then(passwd_md5 => {
              getAuthToken(login, passwd_md5).then((ret) => {
                [url, token] = ret;
                loginIn(url, 'login', JSON.stringify({'login':this.state.login, 'token': token})).then( (sid) => {
                  getListMail(url, 'eac_list',JSON.stringify({'mailbox': '@AppInMail'}), sid).then( (listMail ) =>{
                    global.listMail=listMail;
                    this.setState({
                      visible: false,
                    });
                  });
                });
              });
            })
          }
        })
      } catch (error) {
        console.log("Error retrieving data: " + error);
      }
    }
    this.setState({appState: nextAppState});
  }

  _onTestPress = () => {
    dismissKeyboard();
    global.start = new Date();
    this.setState({
      visible: true,
    });
    global.passwd_md5 = md5.hex_md5(this.state.password);
    getAuthToken(this.state.login, global.passwd_md5).then((ret) => {
      [url, token] = ret;
      global.url = url;
      global.token = token;
      loginIn(url, 'login', JSON.stringify({'login':this.state.login, 'token': token})).then( (sid) => {
        global.sid = sid;
        getListMail(url, 'eac_list',JSON.stringify({'mailbox': '@AppInMail'}), sid).then( (listMail ) =>{
          global.listMail=listMail;
          this.props.navigation.navigate('ListMail');//, { listings: listMail });
          try {
            AsyncStorage.getItem('login').then(login => {
              if (login == null){
                AsyncStorage.setItem('login', this.state.login);
                AsyncStorage.setItem('passwd_md5', global.passwd_md5);
              }
              else {
                try{
                  AsyncStorage.clear().then( () => {
                    AsyncStorage.setItem('login', this.state.login);
                    AsyncStorage.setItem('passwd_md5', global.passwd_md5);
                  })
                } catch(error){
                  console.log(error);
                }
              }})
          } catch (error) {
            console.log("Error saving data: " + error);
          }
          this.setState({visible: false});
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
              ref='PasswdTextInput'
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
                onPress={() => this._onTestPress()}
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
