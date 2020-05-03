import React, { Component } from 'react';
import { Message, MessageButton, MessageText, MessageGroup, Avatar, Row, MessageTitle } from '@livechat/ui-kit';
import botImg from '../public/botAvatar.png';
import userImg from '../public/userAvatar.png';

export class ChatContent extends Component {
  render() {
    return (
      <>
        {this.props.messages.map((message, index) => {
          if (message.id === 1) {
            if (message.senderName === 'bot') {
              return (
                <div key={index}>
                  <Avatar imgUrl={botImg} />
                  <Message authorName='Bot'>
                    <MessageText>{message.message}</MessageText>
                  </Message>
                </div>
              );
            } else {
              return (
                <div key={index}>
                  <Row reverse>
                    <Avatar isOwn={true} imgUrl={userImg} />
                    <Message isOwn={true}>
                      <MessageText>{message.message}</MessageText>
                    </Message>
                  </Row>
                </div>
              );
            }
          } else {
            if (message.message) {
              return (
                <div key={index}>
                  <MessageGroup avatar={botImg} onlyFirstWithMeta>
                    {message.message.map((article, i) => {
                      return (
                        <Message authorName='bot' showMetaOnClick>
                          <MessageTitle title={article.title} subtitle={article.source} />
                          <MessageText>{article.description}</MessageText>
                          <MessageButton label='View more' href={article.url} primary />
                        </Message>
                      );
                    })}
                  </MessageGroup>
                </div>
              );
            } else {
              return <></>;
            }
          }
        })}
      </>
    );
  }
}

export default ChatContent;
