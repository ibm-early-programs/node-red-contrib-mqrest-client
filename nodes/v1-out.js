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

  function postToQueue(msg, config, connection, data) {
    return new Promise(function resolver(resolve, reject) {
      //console.log('Configuration looks like ', config);
      //console.log('Connection information looks like ', connection);

      request({
        uri: connection.url,
        method: 'POST',
        'auth': {
          'user': connection.username,
          'pass': connection.password,
        },
        headers: {
          'ibm-mq-rest-csrf-token': connection.token,
          'Content-Type': config.contentType
        },
        rejectUnauthorized: false,
        //requestCert: true,
        //agent: false,
        body: data
      }, (error, response, body) => {

        if (error) {
          console.log(response);
          reject(error);
        } else {
          switch (response.statusCode) {
            case 200:
            case 201:
              resolve();
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
    var node = this;
    const utils = new Utils(node);

    RED.nodes.createNode(this, config);

    node.connectionNode = RED.nodes.getNode(config.connection);

    this.on('input', function(msg) {
      //var message = '';
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      var connection = null;

      verifyPayload(msg, config)
        .then((data) => {
          return postToQueue(msg, config, node.connectionNode, data);
        })
        .then(function() {
          node.status({ fill: 'blue', shape: 'dot', text: 'payload posted onto queue' });
          node.send(msg);
        })
        .catch(function(err) {
          utils.reportError(msg,err);
          node.send(msg);
        });
    });
  }

  RED.nodes.registerType('mqrest-out', Node, {
    credentials: {
    }
  });
};
