import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Octicons';
import { NavigationActions } from 'react-navigation';

import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  FlatList,
  Text,
  ScrollView,
  Platform,
  AsyncStorage
} from 'react-native';

import Mail from './Mail';
import Login from './Login';

class ListItem extends React.PureComponent {

  constructor(props) {
    super();
    this.state = {
      visible: false
    };
  }

  _onPress = () => {
    this.props.onPressItem(this.props.item);
  }

  render() {
    const item = this.props.item;

    return (
      <TouchableHighlight
        onPress={this._onPress}
        underlayColor='#dddddd' >
        <View>
          <View style={styles.rowContainer}>
            <Image style={styles.thumb} source = {require('../Resources/mail.png')}/>
            <View style={styles.textContainer}>
              <Text style={styles.title}
                numberOfLines={3}>{item.subject}</Text>
              <Text style={styles.author}
                numberOfLines={1}>From: {item.from_name}</Text>
              <Text style={styles.authorEmail}
                numberOfLines={1}>e-mail: {item.from_email}</Text>
            </View>

          </View>
          <View style={styles.separator}/>
        </View>
      </TouchableHighlight>

    );
  }
}

export default class ListMail extends Component {

  static navigationOptions = ({ navigation }) => ({
    headerLeft: (Platform.OS === 'ios') ? (
      <Icon.Button name="sign-out" backgroundColor="#F7F7F7" color="#037aff" onPress={ () => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'Login'})
          ]
        });
        navigation.dispatch(resetAction);
        try {
          AsyncStorage.multiRemove(['login', 'passwd_md5'], (err) => {});
        } catch (error) {
          console.log("Error remooving data: " + error);
        }
      } }>
        <Text style={{fontSize: 17, paddingRight: 10, color: "#037aff"}}>Logout</Text>
      </Icon.Button>
    ) : (
      <Icon.Button name="sign-out" backgroundColor="#FFF" color="#000" onPress={ () => navigation.goBack(null) }>
      </Icon.Button>
    )
  });

  _keyExtractor = (item, index) => index;

  _renderItem = ({item, index}) => (
    <ListItem
      item={item}
      index={index}
      onPressItem={this._onPressItem}
    />
  );

  _onPressItem = (item) => {
    this.setState({
      visible: true
    });
    this.props.navigation.navigate('Mail', { name: item.subject, listings: item });
  };

  render() {
    const mails = this.props.navigation.state.params.listings
    return (
        <FlatList style={styles.highlight}
          data={mails}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
    );
  }
}

const styles = StyleSheet.create({
  thumb: {
    width: 18,
    height: 18,
    marginRight: 10,
    marginTop: 3
  },
  highlight: {
    backgroundColor: '#FFF',
  },
  textContainer: {
    flex: 1
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd'
  },
  title: {
    fontSize: 20,
    color: '#000'
  },
  author: {
    fontSize: 10,
    color: '#303030'
  },
  authorEmail: {
    fontSize: 10,
    color: '#9B9B9B'
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10
  },
});
