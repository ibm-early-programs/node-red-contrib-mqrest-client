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
    msg.payload = 'The node is still being coded';
    return Promise.resolve();
  }

  function Node(config) {
    let node = this;
    const utils = new Utils(node);

    RED.nodes.createNode(this, config);

    node.connectionNode = RED.nodes.getNode(config.connection);

    this.on('input', function(msg) {
      var options = {};
      var query = '';
      var parameters = [];
      //var message = '';
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      var connection = null;

      start()
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
