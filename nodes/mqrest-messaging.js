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

  function Node(config) {
    let node = this;
    const utils = new Utils(node);

    RED.nodes.createNode(this, config);

    this.user = RED.nodes.getNode(config.user);
    this.server = RED.nodes.getNode(config.server);
    
    this.on('input', function (msg) {
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });
      var url;

      if(config.operation === 'PUB'){
        url = `${this.server.prefix}/${config.apiv}/messaging/qmgr/${msg.qmgr}/topic/${msg.topicString}/message`;
        config.operation = 'POST';
      } else {
        url = `${this.server.prefix}/${config.apiv}/messaging/qmgr/${msg.qmgr}/queue/${msg.qname}/message`;
      }
      
      var axiosCommand = utils.axiosCommand(this.user, config, msg, url);
      axiosCommand = utils.generateOptionalHeaders(msg, axiosCommand);

      utils.axiosRequest(axiosCommand)
        .then((data) => {
          node.status({ fill: 'green', shape: 'dot', text: 'message received' });
          return utils.processResponseData(msg, data, 'string');
        })
        .then(function (msg) {
          node.status({});
          node.send(msg);
        })
        .catch(function (err) {
          msg.payload = err;
          utils.reportError(msg, err);
          node.send(msg);
        });
    });
  }

  RED.nodes.registerType('mqrest-messaging', Node, {
    credentials: {
    }
  });
};
