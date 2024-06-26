import { useState, useLayoutEffect, useEffect } from 'react';
import rough from 'roughjs/bundled/rough.esm';

import { hello } from './AppFunctions';

import "./App.css";

const generator = rough.generator();

const createElement = (id, x1, y1, x2, y2, tool) => {

  const roughElement = tool === "line" 
  ? generator.line(x1, y1, x2, y2)
  : generator.rectangle(x1, y1, x2-x1, y2-y1); 
  // o routhElement, que se encontra dentro de cada um dos objetos de elements, serve para criar o
  // elemento usando roughCanvas.draw(roughElement)
  
  return { id, x1, y1, x2, y2, type: tool, roughElement}
}

const getCanvasCoordinates = (event) => {

  const context = document.getElementById("canvas").getContext("2d");

  const mouseX = event.clientX - context.canvas.offsetLeft;
  const mouseY = event.clientY - context.canvas.offsetTop;

  return {mouseX, mouseY}
}

const positionWithinElement = (x, y, element) => {

  const { type, x1, y1, x2, y2 } = element;

  if(type === "rectangle"){
    const topLeft = nearPoint(x, y, x1, y1, "tl");
    const topRight = nearPoint(x, y, x2, y1, "tr");
    const bottomLeft = nearPoint(x, y, x1, y2, "bl");
    const bottomRight = nearPoint(x, y, x2, y2, "br");
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return topLeft || topRight || bottomLeft || bottomRight || inside;
  }
  else{
    const a = {x: x1, y: y1};
    const b = {x: x2, y: y2};
    const c = {x, y};
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    const start = nearPoint(x, y, x1, y1, "start");
    const end = nearPoint(x, y, x2, y, "end");
    const inside = Math.abs(offset) < 1 ? "inside" : null;
    return start || end || inside;
  }
}

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x, y, elements) => {
  return elements
    .map(element => ({...element, position: positionWithinElement(x, y, element)}))
    .find(element => element.position !== null);
}

const adjustElementCoordinates = element => {
  const {type, x1, y1, x2, y2} = element;
  if(type === "rectangle"){
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return {x1: minX, y1: minY, x2: maxX, y2: maxY}
  }
  else{
    if(x1 < x2 || (x1 === x2 && y1 < y2)){
      return {x1, y1, x2, y2}
    }
    else{
      return {x1: x2, y1: y2, x2: x1, y2: y1}
    }
  }
}

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name: null;
}

const cursorForPosition = position => {
  switch(position){
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
}

function App() {

  const [layers, setLayers] = useState([{}]);
  const [layersQty, setLayersQty] = useState(1);

  const [selectedLayer, setSelectedLayer] = useState({
    name: `Layer-${layersQty}`,
    id: layersQty,
    elements: [],
    hidden: false
  });

  const [layerIndex, setLayerIndex] = useState(0);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("rectangle");
  const [selectedElement, setSelectedElement] = useState(null);

  // atualizar layers quando a selectedLayer é alterada
  useEffect(() => {

    const layersCopy = [...layers];
    layersCopy[layerIndex] = selectedLayer;
    setLayers(layersCopy);

  }, [selectedLayer]);

  useLayoutEffect(() => {

    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height); // limpa o canvas

    const roughCanvas = rough.canvas(canvas);
    
    // sempre que a constante "elements" é alterada, o canvas é limpado e seu conteúdo é renderizado
    // novamente. Ele é renderizado usando o roughElement de cada elemento do canva, desenhando ele
    // através de roughCanvas.draw(roughElement)

    layers.map(layer => {
      if(!layer.hidden && layer.elements){
          layer.elements.map(({roughElement}) => {
            roughCanvas.draw(roughElement);
          });
      }
    });

  }, [selectedLayer, layerIndex, layers]); 

  const updateElement = (id, x1, y1, x2, y2, tool) => {

    const updatedElement = createElement(id, x1, y1, x2, y2, tool);

    // update single layer
    const newElements = selectedLayer.elements;
    newElements[id] = updatedElement;
    setSelectedLayer( selectedLayer => ({...selectedLayer, elements: newElements}));
  }

  useEffect(() => {

    layers.map(layer => {
      if(layer.hidden)
        document.getElementById(`layer-${layer.id}`).classList.add("hiddenLayer");
      else
      document.getElementById(`layer-${layer.id}`).classList.remove("hiddenLayer");
    })

  }, [layers]);

  const handleMouseDown = (event) => {

    if(selectedLayer.hidden) return;

    const { mouseX, mouseY } = getCanvasCoordinates(event);

    if(tool === "selection"){
      
      const element = getElementAtPosition(mouseX, mouseY, selectedLayer.elements);
      if(element){
        const offsetX = mouseX - element.x1;
        const offsetY = mouseY - element.y1;
        setSelectedElement({...element, offsetX, offsetY});
        setAction("moving");
      }
    }
    else{
      const id = selectedLayer.elements.length - 1;
      const element = createElement(id, mouseX, mouseY, mouseX, mouseY, tool);
      const newElements = [...selectedLayer.elements, element];
      setSelectedLayer( selectedLayer => ({...selectedLayer, elements: newElements}));

      setAction("drawing");
    }
  }

  const handleMouseMove = (event) => {

    const { mouseX, mouseY } = getCanvasCoordinates(event);

    if(tool === "selection"){
      const element =  getElementAtPosition(mouseX, mouseY, selectedLayer.elements);
      document.getElementById("canvas").style.cursor = element 
      ? cursorForPosition(element.position)
      : "crosshair";
    }

    if(action === "drawing"){
      const index = selectedLayer.elements.length - 1;
      const {x1, y1} = selectedLayer.elements[index];
      updateElement(index, x1, y1, mouseX, mouseY, tool);
    }
    else if(action === "moving"){
      const { id, x1, y1, x2, y2, type, offsetX, offsetY } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1; 
      const newX1 = mouseX - offsetX;
      const newY1 = mouseY - offsetY;
      updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type);
    }
  
  }

  const handleMouseUp = () => {
    const index = selectedLayer.elements.length - 1;
    const {id, type} = selectedLayer.elements[index];
    if(action === "drawing"){
      const {x1, y1, x2, y2} = adjustElementCoordinates(selectedLayer.elements[index]);
      updateElement(id, x1, y1, x2, y2, type);
    }
    console.log(layers);
    setAction("none");
  }

  const createLayer = () => {

    setLayerIndex(layers.length);

    const newLayersQty = layersQty + 1;
    setLayersQty(newLayersQty);

    setSelectedLayer({
      name: `Layer-${newLayersQty}`,
      id: newLayersQty,
      elements: [],
      hidden: false
    });
  }

  const selectLayer = (id) => {

    layers.map((layer, index) => {
      if(layer.id === id){
        setSelectedLayer(layers[index]);
        setLayerIndex(index);
      }
    });
  }

  const hideLayer = (id) => {

    const index = layers.findIndex(layer => layer.id === id);

    const newLayer = {...layers[index], hidden: !layers[index].hidden}
    const newLayers = [...layers];
    newLayers[index] = newLayer;
    setLayers(newLayers);

    if(selectedLayer.id === id)
      setSelectedLayer(selectedLayer => ({...selectedLayer, hidden: !selectedLayer.hidden}));
  }

  const deleteLayer = (id) => {

    if(layers.length === 1) return;

    const index = layers.findIndex(layer => layer.id === id);

    const layersCopy = [...layers];
    const newLayers = layersCopy.filter(layerCopy => layerCopy.id !== id);
    setLayers(newLayers);

    // caso a camada deletada venha antes da camada selecionada, o layerIndex irá ir uma posição
    // para trás
    if(layerIndex > index){
      setLayerIndex(l => l - 1);
    }
    else if(layerIndex === index){
      const newIndex = newLayers.length - 1;
      const newSelectedLayer = newLayers[newIndex];
      setSelectedLayer(newSelectedLayer);
      setLayerIndex(newIndex);
    }
  }

  return (
    <>
      <div className="tools-container">
        <label htmlFor="line">Line</label>
        <input 
          type="radio" 
          id="line"
          checked={tool === "line"}
          onChange={() => setTool("line")}
        /><br/>
        <label htmlFor="rectangle">Rectangle</label>
        <input 
          type="radio" 
          id="rectangle"
          checked={tool === "rectangle"}
          onChange={() => setTool("rectangle")}
        />
        <br/>
        <label htmlFor="selection">Selection</label>
        <input 
          type="radio" 
          id="selection"
          checked={tool === "selection"}
          onChange={() => setTool("selection")}
        />
        <br/>
      </div>
      <div className="canvas-container">
        <div className="layers-container">
          <button onClick={createLayer}>
              Criar camada
            </button>
          <p>Camadas:</p>
          {layers.map(({name, id}, index) => (
            <div 
              key={id} 
              className={id === selectedLayer.id ? "layer selectedLayer" : "layer"} 
              id={`layer-${id}`}
            >
              <div className="layer-name" onClick={() => selectLayer(id)}>
                {name}
              </div>
              <div className="layer-buttons" key={id}>
                <button onClick={() => hideLayer(id)}>Ocultar</button>
                <button onClick={() => deleteLayer(id)}>Deletar</button>
              </div>
            </div>
          ))}
        </div>
        <canvas
          style={{border: "1px solid black"}}
          id="canvas"
          width="800"
          height="400"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
        </canvas><br/>
      </div>
    </>
  )
}

export default App;
