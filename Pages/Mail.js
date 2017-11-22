import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/Octicons';
import {
  View,
  WebView,
  Platform,
  Text,
  AsyncStorage
} from 'react-native';

import {getAuthToken, loginIn, getListMail} from './Login';

export default class Mail extends Component {

  static navigationOptions = ({ navigation }) => ({
    headerLeft: (Platform.OS === 'ios') ? (
      <Icon.Button name="chevron-left"  size={30} backgroundColor="rgba(247, 247, 247, 0)" color="#037aff" onPress={ () => {
        let end = new Date();
        let elapsed = end.getTime() - global.start.getTime();
        if (elapsed>=270000){
          global.start = end;
          try {
          AsyncStorage.getItem('login').then((login) => {
            if (login !== null){
              AsyncStorage.getItem('passwd_md5').then((passwd_md5) => {
                getAuthToken(login, passwd_md5).then((ret) => {
                  [url, token] = ret;
                  loginIn(url, 'login', JSON.stringify({'login':this.state.login, 'token': token})).then( (sid) => {
                    getListMail(url, 'eac_list',JSON.stringify({'mailbox': '@AppInMail'}), sid).then( (listMail ) =>{
                      global.listMail=listMail;
                    });
                  });
                });
              })
            } else if (login == null){
              console.log('needed auth');
            }
          })
        } catch (error) {
          console.log("Error retrieving data: " + error);
        }}
        navigation.goBack();
      } }>
      </Icon.Button>
    ) : (
      <Icon.Button name="chevron-left" backgroundColor="rgba(255, 255, 255, 0)" color="#000" onPress={ () => {console.log('reload'); navigation.goBack();} }>
      </Icon.Button>
    )
  });

  render() {
    const item = this.props.navigation.state.params.listings;
    const data = {'url': global.url,'id': item.id, 'sid': global.sid}

    return (
      <View style={{ flex: 1, backgroundColor: '#FFF' }}>
        <WebView
          source={{uri: `${data.url}/eacviewer_mobile?id=${data.id}&sid=${data.sid}&mailbox=@AppInMail`}}
          style={{marginTop: 0}}
          renderLoading={this.renderLoading}
        />
      </View>
    );
  }
}
