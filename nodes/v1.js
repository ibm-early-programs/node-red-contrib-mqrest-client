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

  function start() {
    return Promise.reject('No Functionality in this node yet - 001');
  }

  function inProgress(msg) {
    // Dummy Function to use when building the structure
    msg.payload = 'The node is still being coded - 001';
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
          'ibm-mq-rest-csrf-token': connection.token,
          'Content-Type': config.contentType
        },
        rejectUnauthorized: false //,
        //requestCert: true,
        //agent: false,
        //body: data
      }, (error, response, body) => {
        if (!error && (200 === response.statusCode
                         || 201 === response.statusCode)) {
          //var b = JSON.parse(body);
          //resolve(b);
          console.log('body looks like ', body);
          console.log('response looks like ', response);
          resolve()
        } else if (error) {
          console.log(response);
          reject(error);
        } else {
          reject('Error Invoking API ' + response.statusCode);
        }
      });

      //reject('Request function still being built');
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
        .then(() => {
          return inProgress(msg);
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
