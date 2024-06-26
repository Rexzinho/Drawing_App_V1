import { useLayoutEffect, useEffect, useContext } from 'react';
import { DrawingContext } from './contexts/DrawingContext';
import rough from 'roughjs/bundled/rough.esm';

import "./App.css";

import DrawingLayers from './DrawingLayers';
import DrawingFunctions from './DrawingFunctions';

function DrawingApp() {

  const {
    layers, setLayers,
    layersQty, setLayersQty,
    selectedLayer, setSelectedLayer,
    layerIndex, setLayerIndex,
    action, setAction,
    tool, setTool,
    selectedElement, setSelectedElement,
    roughSets, setRoughSets

  } = useContext(DrawingContext);

  const {
    createLayer,
    selectLayer,
    hideLayer,
    deleteLayer,
  
  } = DrawingLayers();

  const { 
    createElement, 
    updateElement,
    getCanvasCoordinates, 
    getElementAtPosition, 
    adjustElementCoordinates, 
    cursorForPosition,
    resizedCoordinates,
  
  } = DrawingFunctions();

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
        if(element.position === "inside"){
          setAction("moving");
        }
        else{
          setAction("resizing");
        }
      }
    }
    else{
      const id = selectedLayer.elements.length;
      const roughConfigs = {...roughSets};
      const element = createElement(id, mouseX, mouseY, mouseX, mouseY, tool, roughConfigs);
      const newElements = [...selectedLayer.elements, element];
      setSelectedLayer( selectedLayer => ({...selectedLayer, elements: newElements}));
      setSelectedElement(element);

      setAction("drawing");
    }
  }

  const handleMouseMove = (event) => {

    if(selectedLayer.hidden) return;

    const { mouseX, mouseY } = getCanvasCoordinates(event);

    if(tool === "selection"){
      const element =  getElementAtPosition(mouseX, mouseY, selectedLayer.elements);
      document.getElementById("canvas").style.cursor = element 
      ? cursorForPosition(element.position)
      : "crosshair";
    }

    if(action === "drawing"){
      const index = selectedLayer.elements.length - 1;
      const { x1, y1, roughConfigs } = selectedLayer.elements[index];
      updateElement(index, x1, y1, mouseX, mouseY, tool, roughConfigs);
    }
    else if(action === "moving"){
      const { id, x1, y1, x2, y2, type, offsetX, offsetY, roughConfigs } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1; 
      const newX1 = mouseX - offsetX;
      const newY1 = mouseY - offsetY;
      updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, roughConfigs);
    }
    else if(action === "resizing"){
      const { id, type, roughConfigs, position, ...coordinates} = selectedElement;
      const {x1, y1, x2, y2} = resizedCoordinates(mouseX, mouseY, position, coordinates);
      updateElement(id, x1, y1, x2, y2, type, roughConfigs);
    }
  }

  const handleMouseUp = () => {

    if(selectedLayer.hidden || selectedLayer.elements.length === 0) return;

    const index = selectedElement.id;
    const {id, type, roughConfigs} = selectedLayer.elements[index];

    if(action === "drawing" || action === "resizing"){
      const {x1, y1, x2, y2,} = adjustElementCoordinates(selectedLayer.elements[index]);
      updateElement(id, x1, y1, x2, y2, type, roughConfigs);
    }
    console.log(layers);
    setAction("none");
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
        /><br/>
        <label htmlFor="selection">Selection</label>
        <input 
          type="radio" 
          id="selection"
          checked={tool === "selection"}
          onChange={() => setTool("selection")}
        /><br/>
        <label htmlFor="selection">Color</label>
        <label htmlFor="color">Color</label>
        <input 
          value={roughSets.stroke}
          type="color" 
          id="color"
          onChange={(e) => setRoughSets({...roughSets, stroke: e.target.value})}
        />
        <label htmlFor="selection">Width </label>
        <input 
          value={roughSets.strokeWidth}
          type="range" 
          min="1"
          max="8"
          id="width"
          onChange={(e) => setRoughSets({...roughSets, strokeWidth: e.target.value})}
        /><br/>
      </div>
      <div className="canvas-container">
        <div className="layers-container">
          <button onClick={createLayer}>
              Create Layer
            </button>
          <p>Layers:</p>
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
                  <button onClick={() => hideLayer(id)}>Hide</button>
                  <button onClick={() => deleteLayer(id)}>Delete</button>
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

export default DrawingApp;
