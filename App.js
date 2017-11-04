/*import React from 'react';
import { StyleSheet, Text, View, NavigatorIOS } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Login from './Pages/Login';
import ListMail from './Pages/ListMail';
import Mail from './Pages/Mail';*/

import React, { Component } from 'react';
import { MailStack } from './Config/Router';

export default class CommonScreens extends React.Component {
  render() {
    return <MailStack />;
  }
}

/*export default class CommonScreens extends React.Component {
  render() {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          title: 'Login',
          component: Login,
        }}/>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});*/
