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
  <dt>mqrest-get</dt>
    <dd>reads messages off a queue</dd>
  <dt>mqrest-put</dt>
    <dd>writes messages to a queue</dd>
  <dt>mqrest-pub</dt>
    <dd>publishes messages to a topic</dd>
  <dt>mft-agent</dt>
    <dd>retrieves MFT agent details</dd>
  <dt>mft-monitor</dt>
    <dd>performs MFT monitor operations</dd>
  <dt>mft-transfer-retrieve</dt>
    <dd>retrieves details of transfers</dd>
  <dt>mft-transfers-create</dt>
    <dd>creates transfers</dd>
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
