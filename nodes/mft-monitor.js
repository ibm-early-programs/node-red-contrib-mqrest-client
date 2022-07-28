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

    function request(user, server, config, msg){
      // console.log('user : ', user);
      // console.log('server : ', server);
      // console.log('config : ', config);
      // console.log('msg : ', msg);

      // setting default variables
      if(msg.csrf === undefined) msg.csrf = '';

      switch (config.operation){
        case "GET":
          return get(user, server, config, msg);

        case "POST":
          return pst(user, server, config, msg);

        case "DELETE":
          return dlt(user, server, config, msg);
        
      }
    }
  
    function get(user, server, config, msg) {
      return new Promise(function resolver(resolve, reject) {

        if(msg.monitorName === undefined) msg.monitorName = '';

        // console.log('User information looks like ', user);
        // console.log('Server looks like ', server)
        // console.log('Configuration looks like ', config);
        // console.log(`https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/admin/mft/monitor/${msg.monitorName}`);

        axios({
          url: `https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/admin/mft/monitor/${msg.monitorName}`,
          method: config.operation,
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

    function pst(user, server, config, msg) {
      return new Promise(function resolver(resolve, reject) {

        // set default values
        if(msg.csrf === undefined) msg.csrf = '';

        // console.log(`https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/admin/mft/monitor/${msg.monitorName}`);

        axios({
          url: `https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/admin/mft/monitor/${msg.monitorName}`,
          method: config.operation,
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

    function dlt(user, server, config, msg) {
      return new Promise(function resolver(resolve, reject) {

        // set default values
        if(msg.csrf === undefined) msg.csrf = '';

        var deleteHistory;
        if(config.history){
          deleteHistory = '/history';
        } else {
          deleteHistory = '';
        }

        console.log(`https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/admin/mft/monitor/${msg.monitorName}${deleteHistory}`);

        axios({
          url: `https://${server.host}:${server.port}/ibmmq/rest/${config.apiv}/admin/mft/monitor/${msg.monitorName}${deleteHistory}`,
          method: config.operation,
          auth: {
            username: user.username,
            password: user.password,
          },
          headers: {
            'ibm-mq-rest-csrf-token': msg.csrf,
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

      this.user = RED.nodes.getNode(config.user)
      this.server = RED.nodes.getNode(config.server);
  
      this.on('input', function (msg) {
        //var message = '';
        node.status({ fill: 'blue', shape: 'dot', text: 'initialising' });

        request(this.user, this.server, config, msg)
          .then((data) => {
            node.status({ fill: 'green', shape: 'dot', text: 'details received' });
            return utils.processResponseData(msg, data, 'object');
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
  
    RED.nodes.registerType('mft-monitor', Node, {
      credentials: {
      }
    });
  };
  