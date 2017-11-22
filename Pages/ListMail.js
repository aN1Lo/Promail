import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Octicons';
import { NavigationActions } from 'react-navigation';
import Timestamp from 'react-timestamp';
import Spinner from 'react-native-loading-spinner-overlay';
import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  FlatList,
  Text,
  ScrollView,
  Platform,
  AsyncStorage,
  RefreshControl
} from 'react-native';

import Mail from './Mail';
import {Login, getAuthToken, loginIn, getListMail} from './Login';

class ListItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  _onTouchStart(){
      let end = new Date();
      let elapsed = end.getTime() - global.start.getTime();
      if (elapsed>=270000){
        global.start = end;
        try {
        AsyncStorage.getItem('login').then((login) => {
          if (login !== null){
            this.setState({
              visible: true,
            });
            AsyncStorage.getItem('passwd_md5').then((passwd_md5) => {
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
          } else if (login == null){
            console.log('needed auth');
          }
        })
      } catch (error) {
        console.log("Error retrieving data: " + error);
      }}
  }

  _onPress = () => {
    this._onTouchStart();
    this.props.onPressItem(this.props.item);
  }

  render() {
    const item = this.props.item;
    return (
      <View>
      <TouchableHighlight onPress={this._onPress} underlayColor='#dddddd' >
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
              <Timestamp time={item.timestamp} format='full' includeDay component={Text} style={styles.date}/>
            </View>
          </View>
          <View style={styles.separator}/>
        </View>
      </TouchableHighlight>
      <View style={{ flex: 1 }}>
        <Spinner visible={this.state.visible} textStyle={{color: '#FFF'}} />
      </View>
      </View>
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

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  _onRefresh() {
    this.setState({
      refreshing: true
    });
    let end = new Date();
    let elapsed = end.getTime() - global.start.getTime();
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
                  this.setState({refreshing: false});
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
    }
  }

  _keyExtractor = (item, index) => index;

  _renderItem = ({item, index}) => (
      <ListItem
        item={item}
        index={index}
        onPressItem={this._onPressItem}
      />
  );

  _onPressItem = (item) => {
    this.props.navigation.navigate('Mail', { name: item.subject, listings: item });
  };

  render() {
    const mails = global.listMail//this.props.navigation.state.params.listings
    return (
      <FlatList style={styles.highlight}
        data={mails}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
        refreshControl={<RefreshControl
                        colors={["#515151", "#689F38"]}
                        refreshing={this.state.refreshing}
                        onRefresh={() => this._onRefresh()}
                    />}
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
  date: {
    fontSize: 12,
    color: '#515151'
  },
  rowContainer: {
    flexDirection: 'row',
    padding: 10
  },
});
