import {ChangeEvent, useRef, useState} from 'react';


const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setMouseDown] = useState(false);
  const [newCoordinates, setNewCoordinates] = useState<Coordinates[]>([]);
  const [color, setColor] = useState<string>('#000000');



  const onDrawStart = () => {
    if (!isMouseDown) {
      setMouseDown(true);
    }
  }
  const onDrawEnd = () => {
    if (isMouseDown) {
      setMouseDown(false);
    }
  }
  const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value)
  }
  const onCanvasClick = (event: MouseEvent) => {
    if (isMouseDown) {
      console.log('drawing');
    }
  }


  return (
    <div>
      <input type='color' value={color} onChange={onColorChange}/>
      <canvas ref={canvasRef}
              onMouseOut={onDrawEnd}
              onMouseDown={onDrawStart}
              onMouseUp={onDrawEnd}
              onMouseMove={onCanvasClick}
              style={{height: '900px', width: '900px', border: '1px solid black'}}></canvas>
    </div>
  )
};

export default App
