'use strict';
require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');
// create LINE SDK client
const config = require('./config');
const client = new line.Client(config);
const app = express();
const { WebhookClient } = require('dialogflow-fulfillment');
const { postToDialogflow, createLineTextEvent, convertToDialogflow } = require('./dialogflow')

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  console.log(req.body.events);
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log(event.message);
    switch(event.type){
      case 'message':
        switch(event.message.type){
          case 'text':
            return handleText(req,event);
        }
    }
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});


async function handleText(req) {
  return await postToDialogflow(req);
}

async function handleFulfillment(agent) {
  agent.add("sucess");
  console.log("success");
}
app.use(express.json({ limit: '50mb' }));
app.post('/fulfillment', (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  let intentMap = new Map();
  intentMap.set('Welcome', handleFulfillment);
  agent.handleRequest(intentMap);
});

const port = 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});