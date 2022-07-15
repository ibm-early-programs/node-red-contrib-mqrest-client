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
  
    function processResponseData(msg, data) {
      if ('object' !== typeof data) {
        return Promise.reject('Unexpected type data ' + typeof data);
      } else {
        let b = data;
        try {
          b = JSON.parse(data);
        }
        catch (e) {
        }
        msg.payload = b;
      }
  
      return Promise.resolve(msg);
    }
  
    function retreiveDetails(user, server, config, msg) {
      return new Promise(function resolver(resolve, reject) {
        // console.log('User information looks like ', user);
        // console.log('Server information looks like ', server);
        // console.log('Configuration looks like ', config);

        //set default values
        if(msg.chnlName === undefined) msg.chnlName = '';

        axios({
          url: `https://${server.host}:${server.port}/ibmmq/rest/v1/admin/qmgr/${msg.qmgr}/channel/${msg.chnlName}`,
          method: 'GET',
          auth: {
            username: user.username,
            password: user.password,
          },
          headers: {
            'Accept': 'application/json'
          },
          rejectUnauthorized: false,
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        })
          .then(function (response) {
            switch (response.status) {
              case 200:
              case 201:
                resolve(response.data);
                break;
              default:
                reject('Error Invoking API ' + response.status);
                break;
            }
          })
          .catch(function (error) {
            console.log('ERROR');
            console.log(`Request was sent to: https://${server.host}:${server.port}/ibmmq/rest/v1/admin/qmgr/${msg.qmgr}/channel/${msg.chnlName}`)
            if (error.response) {
              console.log(error.response.data);
              // console.log(error.response.status);
              // console.log(error.response.headers);
            } else if (error.request) {
              console.log(error.request);
            } else {
              console.log('Error',error.message);
            }
            reject(error);
          });
      });
    }
  
  
    function Node(config) {
      let node = this;
      const utils = new Utils(node);
  
      RED.nodes.createNode(this, config);

      this.user = RED.nodes.getNode(config.user);
      this.server = RED.nodes.getNode(config.server);
  
      this.on('input', function (msg) {
        //var message = '';
        node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

        retreiveDetails(this.user, this.server, config, msg)
          .then((data) => {
            node.status({ fill: 'green', shape: 'dot', text: 'details received' });
            return processResponseData(msg, data);
          })
          .then(function (msg) {
            node.status({});
            node.send(msg);
          })
          .catch(function (err) {
            utils.reportError(msg, err);
            node.send(msg);
          });
      });
    }
  
    RED.nodes.registerType('mqrest-channel', Node, {
      credentials: {
      }
    });
  };
  