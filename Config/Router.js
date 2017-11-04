import React from 'react';
import { StackNavigator } from 'react-navigation';

import Login from '../Pages/Login';
import ListMail from '../Pages/ListMail';
import Mail from '../Pages/Mail';

export const MailStack = StackNavigator({
  Login: {
    screen: Login,
    navigationOptions: {
      title: 'Login',
    },
  },
  ListMail: {
    screen: ListMail,
    navigationOptions: {
      title: 'Mails list',
    },
  },
  Mail: {
    screen: Mail,
    navigationOptions: ({ navigation }) => ({
      title: `${navigation.state.params.subject}`,
    }),
  },
});
