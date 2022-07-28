/**
 * Copyright 2018 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

class MQRESTUtils {

  constructor(node) {
    this._node = node;
  }

  reportError(msg, err) {
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
    this._node.status({
      fill: 'red',
      shape: 'dot',
      text: messageTxt
    });

    msg.result = {};
    msg.result['error'] = err;
    this._node.error(messageTxt, msg);
  }

  processResponseData(msg, data, expectedType) {
    if (expectedType !== typeof data) {
      return Promise.reject('Unexpected type data ' + typeof data);
    } else {
      let b = data;
      try {
        b = JSON.parse(data);
      }
      catch (e) {
      }
      msg.payload = b;
      console.log("here", b);
    }

    return Promise.resolve(msg);
  }

  verifyPayload(msg, config) {
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

}

module.exports = MQRESTUtils;
