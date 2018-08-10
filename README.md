# node-red-contrib-mqrest-client

These nodes provides [Node-RED](http://nodered.org) messaging clients
making use of the MQ REST messaging API.

## Install
Use the manage palette option to install these nodes.

## Usage
Two nodes are provided. The output node is used to post messages to a MQ queue.
The function node is used to read with delete messages from a MQ queue.

## Configuration
Use the configuration to specify the full API URL. Which will look something like:

https://&lt;host&gt;:<port>/ibmmq/rest/v1/messaging/qmgr/<queue manager>/queue/<queue>/message

Where:
<dl>
  <dt>host</dt>
  <dd>could be `localhost` if running MQ in a local docker image.</dd>
  <dt>port</dt>
  <dd>is typically 9443</dd>
  <dt>queue manager</dt>
  <dd>may be something like `QM1`</dd>  
  <dt>queue</dt>
  <dd>may be something like `DEV.QUEUE.1`</dd>    
</dl>

resulting in
https://localhost:9443/ibmmq/rest/v1/messaging/qmgr/QM1/queue/DEV.QUEUE.1/message


### Input
The output node expects the message to place on a queue to be in `msg.payload` and  
can be either a text string or a json object.

### Output
The function node performs a read with delete. If found the message is placed on
`msg.payload`. If the message is a JSON object, then
it is first converted into a JSON object before placing on `msg.payload`

## Contributing
For simple typos and fixes please just raise an issue pointing out our mistakes. If you need to raise a pull request please read our [contribution guidelines](https://github.com/ibm-early-programs/node-red-contrib-mqrest-client/blob/master/CONTRIBUTING.md) before doing so.


## Copyright and license

Copyright 2018 IBM Corp. under the Apache 2.0 license.
