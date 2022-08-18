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


const https = require('https');
const axios = require('axios');

class MQRESTUtils {
	
	constructor(node) {
		this._node = node;
		this.headerMap = new Map();
		this.headerMap.set('csrf','ibm-mq-rest-csrf-token');
		this.headerMap.set('corrId','ibm-mq-md-correlationId');
		this.headerMap.set('expiry', 'ibm-mq-md-expiry');
		this.headerMap.set('persistence', 'ibm-mq-md-persistence');
		this.headerMap.set('replyTo', 'ibm-mq-md-replyTo');
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
			// console.log("here", b);
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

	generateOptionalParams(msg) {
		var optionalParams="?";
		for (var x in msg.mqparams) {
			optionalParams += `${x}=${msg.mqparams[x]}&`
		}
		return optionalParams.slice(0,-1);
	}

	generateOptionalHeaders(msg, axiosCommand) {
		for (var x in msg.headers) {
			axiosCommand.headers[this.headerMap.get(x)] = msg.headers[x];
		}
		return axiosCommand;
	}

	axiosCommand(user, config, msg, url) {
		var axiosCommand = {
			url: url+this.generateOptionalParams(msg),
			method: config.operation,
			auth: {
				username: user.username,
				password: user.password,
			},
			httpsAgent: new https.Agent({ rejectUnauthorized: false })
		}
		switch (config.operation) {
			case "PATCH":
			case "POST":
				axiosCommand.data = msg.payload;
			case "DELETE":
				axiosCommand.headers = {
					'ibm-mq-rest-csrf-token': msg.csrf ?? '',
					'Content-Type': config.contentType??"application/json"
				}
				break;
			case "GET":
				axiosCommand.headers = {
					'Accept': config.accept??'application/json'
				}
				break;  
			default:
				break;	
		}
		axiosCommand.headers['Accept'] = config.accept??'application/json';
		axiosCommand = this.generateOptionalHeaders(msg, axiosCommand);
		return axiosCommand;
	}

	axiosRequest(axiosCommand){
		return new Promise(function resolver(resolve, reject){
			axios(axiosCommand)
				.then(function(response) {
					switch (response.status) {
						case 200:
						case 201:
						case 204:
							resolve(response.data);
						  	break;
						default:
						  reject(response.status);
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
					  console.log("Error", error.message);
					}
					reject(error);
				});

		});
	}

}

module.exports = MQRESTUtils;
