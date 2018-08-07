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
  //var settings = require('./settings');

  function verifyPayload(msg, config) {
    let error = null;
    let type = typeof msg.payload
    if (!config.contentType || config.contentType.includes('text/plain')) {
      if ('string' !== type) {
        error = 'Expecting a string in msg.payload';
      }
    } else if (config.contentType.includes('application/json')) {
      if ('object' !== type) {
        error = 'Expecting a json object in msg.payload';
      }  
    }
    if (error) {
      return Promise.reject(error);
    } else {
      return Promise.resolve();
    }
  }

  function inProgress(msg) {
    // Dummy Function to use when building the structure
    msg.payload = 'The node is still being coded';
    return Promise.resolve();
  }

  function reportError(node, msg, err) {
    var messageTxt = err;
    //if (err.code && 'ENOENT' === err.code) {
    //  messageTxt = 'Invalid File Path';
    //}
    if (err.error) {
      messageTxt = err.error;
    } else if (err.description) {
      messageTxt = err.description;
    } else if (err.message) {
      messageTxt = err.message;
    }
    node.status({
      fill: 'red',
      shape: 'dot',
      text: messageTxt
    });

    msg.result = {};
    msg.result['error'] = err;
    node.error(messageTxt, msg);
  }

  function Node(config) {
    var node = this;
    RED.nodes.createNode(this, config);

    node.connectionNode = RED.nodes.getNode(config.connection);

    this.on('input', function(msg) {
      var options = {};
      var query = '';
      var parameters = [];
      //var message = '';
      node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

      var connection = null;

      verifyPayload(msg, config)
        .then(() => {
          return inProgress(msg);
        })
        .then(function() {
          node.status({});
          node.send(msg);
        })
        .catch(function(err) {
          reportError(node,msg,err);
          node.send(msg);
        });
    });
  }

  RED.nodes.registerType('mqi-out', Node, {
    credentials: {
    }
  });
};
