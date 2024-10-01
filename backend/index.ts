import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {WebSocket} from 'ws';
import {Coordinates} from './types';
import fileDb from './fileDb';

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
  ws.on('message', async (message) => {
      try {
        const decodeMessage = JSON.parse(message.toString()) as IncomingMessage;
        if (decodeMessage.type === 'SEND_COORDINATES') {
          await fileDb.addItem([...decodeMessage.payload])

          connectedClients.forEach(clientWs => {
            clientWs.send(JSON.stringify({
              type: 'NEW_COORDINATE',
              payload: [...decodeMessage.payload]
            }));
          });
        }
          if (decodeMessage.type === 'GET_COORDINATES') {
            const oldCoordinates = await fileDb.getItems();
            ws.send(JSON.stringify({
              type: 'OLD_COORDINATE',
              payload: oldCoordinates
            }));
          }
        if (decodeMessage.type === 'RESET_COORDINATES') {
          await fileDb.removeItems();
          ws.send(JSON.stringify({
            type: 'RESET_COORDINATE',
            payload: []
          }));
        }
      } catch (err) {
        ws.send(JSON.stringify({error: 'invalid message'}));
      }
    }
  )
  ;
  ws.on('close', () => {
    connectedClients.splice(connectedClients.indexOf(ws), 1);
    console.log('client disconnected');
  });
});

app.use(router);

const port = 8000;

const run = async () => {
  await fileDb.init();
  app.listen(port, () => console.log(`Server started on port ${port}`));
};
run().catch(console.error);