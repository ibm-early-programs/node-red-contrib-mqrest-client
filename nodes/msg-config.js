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

 module.exports = function(RED) {
    function MsgConfigNode(config) {
      RED.nodes.createNode(this, config);
      
      if(config.apiv == undefined){
        config.apiv = 1;
      }
      if(config.token === ''){
        config.token = "token";
      }

      var serverNode = RED.nodes.getNode(config.server);

      this.host = serverNode.host;
      this.port = serverNode.port;
      this.apiv = config.apiv;
      this.qmgr = config.qmgr;
      this.qname = config.qname;
      this.topic = config.topic;
      this.token = config.token;

    }
 
    RED.nodes.registerType('msg-config', MsgConfigNode, {
      credentials: {
      }
    });
  };