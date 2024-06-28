import { useLayoutEffect, useEffect, useContext, useState } from 'react';
import { DrawingContext } from './contexts/DrawingContext';
import rough from 'roughjs/bundled/rough.esm';

import logos from "./assets/index";

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
    upLayer,
    downLayer
  
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

  const [isFilled, setIsFilled] = useState(false);

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

    // a array layers precisa ser exibida ao contrário pois os últimos elementos renderizados 
    // sobrepoem os que foram renderizados anteriormente
    
    layers.slice().reverse().forEach(layer => {
      if (!layer.hidden && layer.elements) {
        layer.elements.forEach(({ roughElement }) => {
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
      const roughConfigs = isFilled ? {...roughSets} : {...roughSets, fill: "rgba(0, 0, 0, 0)"}
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
    <div className="drawing-app">
      <div className="tools-container">
        <button 
          className={tool === "rectangle"
            ? "draw-button tool selectedTool" 
            : "draw-button tool"} 
          onClick={() => setTool("rectangle")}
        >
          <img src={logos.Square} alt="Square"/>
        </button>
        <button 
          className={tool === "line"
            ? "draw-button selectedTool" 
            : "draw-button tool"} 
          onClick={() => setTool("line")}
        >
          <img src={logos.Line} alt="Line"/>
        </button>
        <button 
            className={tool === "selection"
              ? "draw-button tool selectedTool" 
              : "draw-button tool"} 
          onClick={() => setTool("selection")}
        >
          <img src={logos.Selection} alt="Line"/>
        </button>

        <label htmlFor="stroke">Color</label>
        <input 
          value={roughSets.stroke}
          type="color" 
          id="stroke"
          onChange={(e) => setRoughSets({...roughSets, stroke: e.target.value})}
        />

        <label htmlFor="strokeWidth">Width</label>
        <input 
        value={roughSets.strokeWidth}
        type="range" 
        min="1"
        max="8"
        id="strokeWidth"
        onChange={(e) => setRoughSets({...roughSets, strokeWidth: e.target.value})}
        /><br/>

        <label htmlFor="isFilled">Fill</label>
        <input
          type="checkbox"
          id="isFilled"
          checked={isFilled}
          onChange={() => setIsFilled(prevIsFilled => !prevIsFilled)}
        />
        <input 
          value={roughSets.fill}
          type="color" 
          id="fill"
          onChange={(e) => {setRoughSets({...roughSets, fill: e.target.value})}}
        />
      </div>
      <div className="canvas-container">
        <div className="layers-container">
          <div className="layers-box">
            <div className="layers-display">
              {layers.map((layer, index)  => (
                <div 
                  key={layer.id} 
                  className={layer.id === selectedLayer.id ? "layer selectedLayer" : "layer"} 
                  id={`layer-${layer.id}`}
                >
                  <div className="layer-name" onClick={() => selectLayer(layer.id)}>
                      {layer.name}
                  </div>
                  <button
                    className="draw-button hide-button"
                    onClick={() => hideLayer(index)}
                  >
                    <img 
                      className={layer.hidden && "hidden"} 
                      src={logos.View}
                      style={{width: "10px"}}
                      />
                  </button>
                </div>
              ))}
            </div>
            <div className="layer-buttons" key={selectedLayer.id}>
              <button onClick={createLayer} className="draw-button">
                <img src={logos.Layer} alt="CreateLayer" />
              </button>
              <button onClick={() => deleteLayer(selectedLayer.id)} className="draw-button">
                <img src={logos.Trash} alt="DeleteLayer" />
              </button>
              <button onClick={() => upLayer(selectedLayer.id)} className="draw-button">
                <img src={logos.Arrow} alt="DeleteLayer" />
              </button>
              <button onClick={() => downLayer(selectedLayer.id)} className="draw-button">
                <img src={logos.Arrow} alt="DeleteLayer" style={{transform: "rotate(180deg)"}}/>
              </button>
            </div>
          </div>
        </div>
        <canvas
          style={{border: "1px solid black"}}
          id="canvas"
          width="800"
          height="500"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
        </canvas><br/>
      </div>
    </div>
  )
}

export default DrawingApp;
