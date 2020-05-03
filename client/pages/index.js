import React from 'react';
import axios from 'axios';
import { ThemeProvider, MessageList, TextComposer, TextInput, TitleBar, Row, SendButton } from '@livechat/ui-kit';
import Pusher from 'pusher-js';
import ChatContent from '../components/ChatContent';

import { theme } from '../css/theme';
// const config = require('../config/dev');

const pusher = new Pusher('77aed243a5c30130f0be', {
  cluster: 'ap2',
  encrypted: true,
});

const channel = pusher.subscribe('news');

export default class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [
        {
          id: 1,
          message: 'Hello!! Ask me Some News?',
          senderName: 'bot',
        },
        {
          id: 1,
          message: 'Get Headlines from different countries, categories ......',
          senderName: 'bot',
        },
      ],
    };
  }

  componentDidMount() {
    // listener on first mount
    this.receiveUpdateFromPusher();
  }

  receiveUpdateFromPusher() {
    // console.log('In Update');
    channel.bind('welcome', (message) => {
      this.setState({
        messages: [
          ...this.state.messages,
          {
            id: 1,
            message,
            senderName: 'bot',
          },
        ],
      });
    });

    channel.bind('news-update', (articles) => {
      const newMessages = articles.map((article) => {
        // console.log(article);
        return {
          source: article.source.name,
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
        };
      });
      const intro = newMessages.length ? 'Here you go, i found some news' : "I couldn't find any :-(. Search again";
      this.setState({
        messages: [
          ...this.state.messages,
          {
            id: 1,
            message: intro,
            senderName: 'bot',
          },
          {
            id: 2,
            message: newMessages,
            senderName: 'bot',
          },
        ],
      });
    });
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  handleKeyPress = async (e) => {
    if (e.key === 'Enter' && e.target.value) {
      const message = e.target.value;
      this.setState({ message: '' });
      this.pushMessage(message);

      try {
        const res = await axios.post('https://newz-chatbot.herokuapp.com/message', { message });
        // console.log(res);
      } catch (err) {
        throw err;
      }
    }
  };

  pushMessage(message) {
    this.setState({
      messages: [
        ...this.state.messages,
        {
          id: 1,
          message,
          senderName: 'user',
        },
      ],
    });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <div className='chat-wrapper'>
          <h1 style={{ display: 'flex', justifyContent: 'center', fontSize: '40px', fontWeight: 'bolder' }}>
            {' '}
            News Bot
          </h1>
          {/* <h1 style={{ display: 'flex', justifyContent: 'center' }}> News Bot</h1> */}
          <>
            <ChatContent messages={this.state.messages} />
            <input
              className='chat-input'
              type='text'
              value={this.state.message}
              onChange={this.handleChange.bind(this)}
              onKeyPress={this.handleKeyPress.bind(this)}
              placeholder='Type a message...'
            />
          </>
        </div>
      </ThemeProvider>
    );
  }
}
