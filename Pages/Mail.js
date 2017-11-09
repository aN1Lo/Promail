import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import {
  View,
  WebView
} from 'react-native';

export default class Mail extends Component {

  render() {
    const item = this.props.navigation.state.params.listings;
    const data = {'url': global.url,'id': item.id, 'sid': global.sid}

    return (
      <View style={{ flex: 1, backgroundColor: '#FFF' }}>
        <WebView
          source={{uri: `${data.url}/eacviewer_mobile?id=${data.id}&sid=${data.sid}&mailbox=@AppInMail`}}
          style={{marginTop: 0}}
          renderLoading={this.renderLoading}
          startInLoadingState
        />
      </View>
    );
  }
}
