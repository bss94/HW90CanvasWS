import {ChangeEvent, useEffect, useRef, useState} from 'react';
import {Coordinates, IncomingMessage} from './types.ts';


const App = () => {
  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setMouseDown] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
  const [newCoordinates, setNewCoordinates] = useState<Coordinates[]>([]);
  const [color, setColor] = useState<string>('#000000');
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/canvas`);
    ws.current.onclose = () => console.log('WS disconnected');
    ws.current.onmessage = (event) => {
      const decodedMessages = JSON.parse(event.data) as IncomingMessage;
      if (decodedMessages.type === 'NEW_COORDINATE') {
        setCoordinates((prevState) => [...prevState, ...decodedMessages.payload]);
      } else if (decodedMessages.type === 'OLD_COORDINATE') {
        setCoordinates([...decodedMessages.payload]);
      }
      else if (decodedMessages.type === 'RESET_COORDINATE') {
        setCoordinates([...decodedMessages.payload]);
      }
    };
    setTimeout(()=>{
      if (!ws.current) {
        return;
      }
      ws.current.send((JSON.stringify({
        type: 'GET_COORDINATES',
        payload: [],
      })));
    },250)
    return () => {
      ws.current?.close();
    };
  }, []);
  useEffect(() => {
    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, 200, 200);
      for (let i = 0; i < coordinates.length; i++) {
        ctx.fillStyle = coordinates[i].color;
        ctx.fillRect(coordinates[i].x, coordinates[i].y, 1, 1);
      }
    };
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      draw(context);
    }
  }, [coordinates]);

  const onDrawStart = () => {
    if (!isMouseDown) {
      setMouseDown(true);
    }
  };
  const onDrawEnd = () => {
    if (isMouseDown) {
      setMouseDown(false);
      if (!ws.current) {
        return;
      }
      ws.current.send((JSON.stringify({
        type: 'SEND_COORDINATES',
        payload: newCoordinates,
      })));
      setNewCoordinates([]);
    }
  };
  const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };
  const onCanvasClick = (event: MouseEvent) => {
    if (isMouseDown) {
      const canvas = canvasRef.current;
      const bounding = canvas?.getBoundingClientRect();
      const context = canvas?.getContext('2d');
      if (bounding && context) {
        setNewCoordinates(prevState => [...prevState,
          {
            x: (event.clientX - bounding.left) / 3,
            y: (event.clientY - bounding.top) / 6,
            color: color,
          }
        ]);
        context.fillStyle = color;
        context.fillRect((event.clientX - bounding.left) / 3, (event.clientY - bounding.top) / 6, 1, 1);
      }
    }
  };
  const onResetCoordinates=()=>{
    if (!ws.current) {
      return;
    }
    ws.current.send((JSON.stringify({
      type: 'RESET_COORDINATES',
      payload: [],
    })));
    setCoordinates([]);
  }
  return (
    <div>
      <input type="color" value={color} onChange={onColorChange}/>
      <button onClick={onResetCoordinates}>RESET</button>
      <canvas ref={canvasRef}
              onMouseOut={onDrawEnd}
              onMouseDown={onDrawStart}
              onMouseUp={onDrawEnd}
              onMouseMove={onCanvasClick}
              style={{height: '900px', width: '900px', border: '1px solid black'}}></canvas>
    </div>
  );
};

export default App;
