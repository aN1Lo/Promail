import React, { Component } from 'react';
import md5 from "react-native-md5";
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';

//import Container from '../Components/Container';
import Button from '../Components/Button';
import Label from '../Components/Label';

import ListMail from './ListMail'

export default class Login extends Component {

  constructor(props) {
    super();
    this.state = {
      visible: false
    };
  }

  getInitialState() {
    return {
      borderBottomColor: '#f0f0f0',
      borderBottomWidth: 1
    }
  }

  onFocus() {
    this.setState({
      borderBottomColor: '#da0750',
      borderBottomWidth: 1
    })
  }

  onBlur() {
    this.setState({
      borderBottomColor: '#f0f0f0',
      borderBottomWidth: 1
    })
  }

  onTestPress = () => {
    //setInterval(() => {
      this.setState({
        visible: true
      });
    //}, 1000);
    //console.log(md5.hex_md5(this.state.password));

    const data = {'user_id': this.state.login,'password_md5': md5.hex_md5(this.state.password)};
    return fetch(`https://admin.appinmail.io/api/v1/experimental/promail/prepare_user_runtime_2?user_id=${data.user_id}&password_md5=${data.password_md5}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
    }).then((response) => response.json())
      .then((responseJson) => {
       if (responseJson[0] == 'success'){
         url = responseJson[1]['promail_url'];
         token = responseJson[1]['access_token'];
         //console.log(url);
         //doLogin(url, access_token)
         const data = {'action_name': 'login','xml_data': JSON.stringify({'login':this.state.login, 'token': token})};
         return fetch(url+`/restapi.py?action_name=${data.action_name}&xml_data=${data.xml_data}`, {
           method: 'POST',
           headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
         }).then((response) => response.json())
         .then((responseJson) => {
         if (responseJson[0] == 'success')
           {
             const data = {'action_name': 'eac_list','xml_data': JSON.stringify({'mailbox': '@AppInMail'}), 'sid':responseJson[1]['sid']}
             return fetch(url+`/restapi.py?action_name=${data.action_name}&xml_data=${data.xml_data}&sid=${data.sid}`, {
               method: 'POST',
               headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}
             }).then((response) => response.json())
             .then((responseJson) => {

               if (responseJson[0] == 'success')
               {
                 var arrayLength = responseJson[1].length;
                 global.url = url;
                 global.sid = data.sid;

                 //this.props.navigator.push({
                //   title: 'Mails list',
                //   component: ListMail,
                //   passProps: {listings: responseJson[1]}
                 //});
                 //console.log(responseJson[1])
                 this.props.navigation.navigate('ListMail', { listings: responseJson[1] });
                 this.setState({
                   visible: false
                 });
               }
             })
             .catch((error) => {
               console.error(error);
             });


         }
         else
           console.log('something wrong');

         })
         .catch((error) => {
           console.error(error);
         });


       } else {
         console.log('something wrong');
       }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
        <KeyboardAwareScrollView
            innerRef={ref => {this.scroll = ref}}
            style={styles.scroll}
            extraHeight={270} >
          <View style={{height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 60 }}>
            <Image source = {require('../Resources/welcome_message_head.png')}/>
          </View>
          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={styles.textInput}
              selectTextOnFocus={true}
              onBlur={ () => this.onBlur() }
              onFocus={ () => this.onFocus() }
              underlineColorAndroid={'transparent'}
              onChangeText={(text) => this.setState({
                  login: text,
              })}
              placeholder='Login / Email' />
          </View>
          <View style={{ marginBottom: 20 }}>
            <TextInput
              onBlur={ () => this.onBlur() }
              onFocus={ () => this.onFocus() }
              secureTextEntry={true}
              style={styles.textInput}
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
                //onPress={this.press.bind(this)}
              />
              </View>
          </View>
        </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
    scroll: {
      padding: 30,
      flexDirection: 'column',
      backgroundColor: '#FFF'
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
   textInput: {
     height: 60,
     fontSize: 20,
     borderBottomColor: '#f0f0f0',
     borderBottomWidth: 1
   }
});
