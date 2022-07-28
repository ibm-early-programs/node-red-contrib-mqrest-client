/**
 * Copyright 2022 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
  const https = require('https');
  const axios = require('axios');
  const Utils = require('./mqrest-utils');

  function publishToTopic(user, server, config, msg) {
    return new Promise(function resolver(resolve, reject) {
      // console.log('User looks like ', user);
      // console.log('Server looks like ', server);
      // console.log('Configuration looks like ', config);
      console.log(`https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/messaging/qmgr/${msg.qmgr}/topic/${msg.topicString}/message`);

      // set default values
      if(msg.csrf === undefined) msg.csrf = '';
 
      axios({
        url: `https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/messaging/qmgr/${msg.qmgr}/topic/${msg.topicString}/message`,
        method: 'POST',
        auth: {
          username: user.username,
          password: user.password,
        },
        headers: {
          'ibm-mq-rest-csrf-token': msg.csrf,
          'Content-Type': config.contentType
        },
        rejectUnauthorized: false,
        data: msg.payload,
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      })
        .then(function (response) {
          switch (response.status) {
            case 200:
            case 201:
              resolve();
              break;
            default:
              reject('Error Invoking API ' + response.statusCode);
              break;
          }
        })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
          reject(error);
        });
    });
  }

  function Node(config) {
    var node = this;
    const utils = new Utils(node);

    RED.nodes.createNode(this, config);

    this.user = RED.nodes.getNode(config.user);
    this.server = RED.nodes.getNode(config.server);

    this.on('input', function (msg) {
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      utils.verifyPayload(msg, config)
        .then((data) => {
          msg.payload = data;
          return publishToTopic(this.user, this.server, config, msg);
        })
        .then(function (msg) {
          node.status({ fill: 'blue', shape: 'dot', text: 'payload published to topic' });
        })
        .catch(function (err) {
          utils.reportError(msg, err);
          node.send(msg);
        });
    });
  }
  RED.nodes.registerType('mqrest-pub', Node, {
    credentials: {
    }
  });

}