import React, { Component } from 'react';
import { MailStack } from './Config/Router';
import { View, Platform, StatusBar } from 'react-native';

export default class CommonScreens extends React.Component {
  render() {
    return (
      <View style={{paddingTop: Platform.OS === 'ios' ? 0 : Expo.Constants.statusBarHeight, flex: 1}}>
        <MailStack />
      </View>
    )
  }
}
