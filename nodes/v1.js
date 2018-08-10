/**
 * Copyright 2018 IBM Corp.
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

module.exports = function(RED) {
  const request = require('request');
  const Utils = require('./mqrest-utils');

  function processResponseData(msg, data) {
    if ('string' !== typeof data) {
      return Promise.reject('Unexpected type data ' + typeof data);
    } else {
      let b = data;
      try {
        b = JSON.parse(data);
      }
      catch(e) {
      }
      msg.payload = b;
    }

    return Promise.resolve();
  }

  function readFromQueue(msg, config, connection) {
    return new Promise(function resolver(resolve, reject) {
      //console.log('Configuration looks like ', config);
      //console.log('Connection information looks like ', connection);

      request({
        uri: connection.url,
        method: 'DELETE',
        'auth': {
          'user': connection.username,
          'pass': connection.password,
        },
        headers: {
          'ibm-mq-rest-csrf-token': connection.token
        },
        rejectUnauthorized: false
      }, (error, response, body) => {
        if (error) {
          console.log(response);
          reject(error);
        } else {
          switch (response.statusCode) {
            case 200:
            case 201:
              resolve(body);
              break;
            case 204:
              reject('Queue is empty');
              break;
            default:
              reject('Error Invoking API ' + response.statusCode);
              break;
          }
        }
      });

    });
  }


  function Node(config) {
    let node = this;
    const utils = new Utils(node);

    RED.nodes.createNode(this, config);

    node.connectionNode = RED.nodes.getNode(config.connection);

    this.on('input', function(msg) {
      //var message = '';
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      var connection = null;

      readFromQueue(msg, config, node.connectionNode)
        .then((data) => {
          node.status({ fill: 'green', shape: 'dot', text: 'message received' });
          return processResponseData(msg, data);
        })
        .then(function() {
          node.status({});
          node.send(msg);
        })
        .catch(function(err) {
          utils.reportError(msg, err);
          node.send(msg);
        });
    });
  }

  RED.nodes.registerType('mqrest', Node, {
    credentials: {
    }
  });
};
