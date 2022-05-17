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

  function verifyPayload(msg, config) {
    let error = null;
    let stringPayload = msg.payload;
    let type = typeof msg.payload
    if (!config.contentType || config.contentType.includes('text/plain')) {
      if ('string' !== type) {
        error = 'Expecting a string in msg.payload';
      }
    } else if (config.contentType.includes('application/json')) {
      if ('object' !== type) {
        error = 'Expecting a json object in msg.payload';
      } else {
        stringPayload = JSON.stringify(msg.payload);
      }
    }
    if (error) {
      return Promise.reject(error);
    } else {
      return Promise.resolve(stringPayload);
    }
  }

  function publishToTopic(config, user, contentType, data) {
    return new Promise(function resolver(resolve, reject) {
      // console.log('Configuration looks like ', config);
      // console.log('User information looks like ', user);
      // console.log(`https://${config.host}:${config.port}/ibmmq/rest/v${config.apiv}/messaging/qmgr/${config.qmgr}/topic/${config.topic}/message`);
 
      axios({
        url: `https://${config.host}:${config.port}/ibmmq/rest/v${config.apiv}/messaging/qmgr/${config.qmgr}/topic/${config.topic}/message`,
        method: 'POST',
        auth: {
          username: user.username,
          password: user.password,
        },
        headers: {
          'ibm-mq-rest-csrf-token': config.token,
          'Content-Type': contentType
        },
        rejectUnauthorized: false,
        data: data,
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
            console.log(error.response.status);
            console.log(error.response.headers);
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
    this.msgconfig = RED.nodes.getNode(config.msgconfig);

    this.on('input', function (msg) {
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      verifyPayload(msg, config)
        .then((data) => {
          return publishToTopic(this.msgconfig, this.user, config.contentType, data);
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