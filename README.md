# node-red-contrib-mqrest-client

These nodes provides [Node-RED](http://nodered.org) messaging clients
making use of the MQ REST messaging API.

## Install
Use the manage palette option to install these nodes.

## Usage
Fourteen nodes are provided.
<dl>
  <dt>mqrest-channel</dt> 
    <dd>retrieves channel information</dd>
  <dt>mqrest-installation</dt> 
    <dd>retrieves installation information</dd>
  <dt>mqrest-login </dt>
    <dd> can be used to log in, log out and query a user</dd>
  <dt>mqrest-messaging</dt>
    <dd>provides messaging functionality (put, get, pub)</dd>
  <dt>mft-agent</dt>
    <dd>retrieves MFT agent details</dd>
  <dt>mft-monitor</dt>
    <dd>performs MFT monitor operations</dd>
  <dt>mft-transfer</dt>
    <dd>retrieves details of, and creates transfers</dd>
  <dt>mqrest-qmgr</dt>
    <dd>retrieves details of queue managers</dd>
  <dt>qmgr-mqsc</dt>
    <dd>runs an MQSC command</dd>
  <dt>mqrest-queue</dt>
    <dd>creates, deletes, modifies and retrieves details of a queue</dd>
  <dt>mqrest-sub</dt>
    <dd>retrieves details of subscriptions</dd>
</dl>

## Configuration
Use the configuration to enter user and server details. Once created the user and server details can be reused with other mqrest nodes.

In user:
<dl>
  <dt>username</dt>
  <dd>is the username of a user with authentication to use the REST API</dd>
  <dt>password</dt>
  <dd>the password for this user</dd>


In server:
<dl>
  <dt>host</dt>
  <dd>could be `localhost` if running MQ in a local docker image.</dd>
  <dt>port</dt>
  <dd>is typically 9443</dd>
</dl>

### Input
Each node expects parameters via a `msg` object (e.g. the message to place on a queue to be in `msg.payload`). See the configuration panel of a node to see its expected parameters.

### Output
If a node can give an output, it will have a connector on the right. The output will almost always be the json string returned from MQ.

## Contributing
For simple typos and fixes please just raise an issue pointing out our mistakes. If you need to raise a pull request please read our [contribution guidelines](https://github.com/ibm-early-programs/node-red-contrib-mqrest-client/blob/master/CONTRIBUTING.md) before doing so.


## Copyright and license

Copyright 2022 IBM Corp. under the Apache 2.0 license.


## Example flows
### Linking queue depth to a UI gauge

`
[{"id":"a341b09eb8c81942","type":"tab","label":"Flow 9","disabled":false,"info":"","env":[]},{"id":"7f7cae7a622b0f17","type":"ui_gauge","z":"a341b09eb8c81942","name":"","group":"68eb6cca3fbe9d5d","order":0,"width":0,"height":0,"gtype":"gage","title":"DEV.QUEUE.1 Queue Depth","label":"Messages","format":"{{msg.payload.currentDepth}}","min":0,"max":"5000","colors":["#00b500","#e6e600","#ca3838"],"seg1":"","seg2":"","className":"","x":820,"y":640,"wires":[]},{"id":"1198a593d53e0ff9","type":"mqrest-queue","z":"a341b09eb8c81942","name":"","user":"8bb2a9c81bae9f00","server":"c813686f07868d8b","apiv":"v1","operation":"GET","x":390,"y":640,"wires":[["78cf75c68ef6505c"]]},{"id":"2ae88e3dd11cc21b","type":"inject","z":"a341b09eb8c81942","name":"","props":[{"p":"mqparams.qmgr","v":"QM1","vt":"str"},{"p":"mqparams.qname","v":"DEV.QUEUE.1","vt":"str"},{"p":"mqparams.status","v":"status.currentDepth","vt":"str"},{"p":"mqparams.attributes","v":"storage.maximumDepth","vt":"str"}],"repeat":"20","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":170,"y":640,"wires":[["1198a593d53e0ff9"]]},{"id":"78cf75c68ef6505c","type":"function","z":"a341b09eb8c81942","name":"","func":"msg.payload.currentDepth = msg.payload.queue[0].status.currentDepth;\nreturn msg","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":600,"y":640,"wires":[["7f7cae7a622b0f17"]]},{"id":"68eb6cca3fbe9d5d","type":"ui_group","name":"Default","tab":"440c82d8f94d11fb","order":1,"disp":true,"width":"6","collapse":false,"className":""},{"id":"8bb2a9c81bae9f00","type":"user-config","name":"ADMIN","username":"mqadmin","password":"mqadmin"},{"id":"c813686f07868d8b","type":"server-config","name":"","host":"localhost","port":"9443","allowSelfSigned":true},{"id":"440c82d8f94d11fb","type":"ui_tab","name":"Home","icon":"dashboard","disabled":false,"hidden":false}]
`

### Sending QM status to twitter DM

`
[{"id":"c9634fa8db54069b","type":"tab","label":"Flow 11","disabled":false,"info":"","env":[]},{"id":"33966ca71ec197f6","type":"twitter out","z":"c9634fa8db54069b","twitter":"","name":"Tweet","x":690,"y":480,"wires":[]},{"id":"5fe8c2fa916dbbbb","type":"mqrest-qmgr","z":"c9634fa8db54069b","name":"","user":"8bb2a9c81bae9f00","server":"c813686f07868d8b","qmgr":null,"apiv":"v2","x":360,"y":480,"wires":[["9a30ad5ed87bef3c"]]},{"id":"d969950ceac03694","type":"inject","z":"c9634fa8db54069b","name":"","props":[{"p":"payload"},{"p":"topic","vt":"str"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"","payloadType":"date","x":160,"y":480,"wires":[["5fe8c2fa916dbbbb"]]},{"id":"9a30ad5ed87bef3c","type":"function","z":"c9634fa8db54069b","name":"","func":"console.log(msg.payload)\nmsg.payload = `D NodeREDTest10 Hello ${JSON.stringify(msg.payload)}`;\nnode.send(msg);","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":540,"y":480,"wires":[["33966ca71ec197f6"]]},{"id":"8bb2a9c81bae9f00","type":"user-config","name":"ADMIN","username":"mqadmin","password":"mqadmin"},{"id":"c813686f07868d8b","type":"server-config","name":"","host":"localhost","port":"9443","allowSelfSigned":true}]
`
