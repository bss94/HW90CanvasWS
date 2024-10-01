import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';
import {Coordinates} from './types';

interface IncomingMessage {
  type: string;
  payload: Coordinates[];
}

const app = express();
expressWs(app);
app.use(cors());

const router = express.Router();

const connectedClients: WebSocket[] = [];

router.ws('/canvas', (ws, req) => {
  console.log('client connected');
  connectedClients.push(ws);
  ws.on('message', (message) => {
    try {
      const decodeMessage = JSON.parse(message.toString()) as IncomingMessage;
      if (decodeMessage.type === 'SEND_COORDINATES') {
        connectedClients.forEach(clientWs => {
          clientWs.send(JSON.stringify({
            type: 'NEW_COORDINATE',
            payload: [...decodeMessage.payload]
          }));
        });
      }
    } catch (err) {
      ws.send(JSON.stringify({error: 'invalid message'}));
    }
  });
  ws.on('close', () => {
    connectedClients.splice(connectedClients.indexOf(ws), 1);
    console.log('client disconnected');
  });
});

app.use(router);

const port = 8000;
app.listen(port, () => {
  console.log(`server started on port: ${port}`);
});