import React, { Component } from 'react'

import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  FlatList,
  Text,
} from 'react-native';

import Mail from './Mail'

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
        underlayColor='#dddddd'>
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
    //console.log(item)
    //this.props.navigator.push({
      //title: item.subject,
      //component: Mail,
      //passProps: {listings: item}
    //});
    this.props.navigation.navigate('Mail', { title: item.subject, listings: item });
  };

  render() {
    //console.log(this.props.navigation.state.params.listings)
    const mails = this.props.navigation.state.params.listings
    return (
      <FlatList
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
