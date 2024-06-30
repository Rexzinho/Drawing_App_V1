import { useContext } from 'react';
import { DrawingContext } from './contexts/DrawingContext';

import rough from 'roughjs/bundled/rough.esm';
const generator = rough.generator();

import { getSvgPathFromStroke } from './DrawingFreeHand';
import getStroke from 'perfect-freehand';

const DrawingFunctions = () => {

  const { selectedLayer, setSelectedLayer} = useContext(DrawingContext);
  
  const createElement = (id, x1, y1, x2, y2, tool, roughConfigs) => {

    let roughElement;

    switch(tool){
      case "line":
        const lineSets = {stroke: roughConfigs.stroke, strokeWidth: roughConfigs.strokeWidth}
        roughElement = generator.line(x1, y1, x2, y2, {...lineSets});
        return { id, x1, y1, x2, y2, type: tool, roughElement, roughConfigs: {...lineSets}};
      case "rectangle":
        roughElement = generator.rectangle(x1, y1, x2-x1, y2-y1, {...roughConfigs}); 
        return { id, x1, y1, x2, y2, type: tool, roughElement, roughConfigs};
      case "pencil":
        return {id, type: tool, points: [{x: x1, y: y1}]};
      default:
        throw new Error(`Tool not recognised: ${tool}`);
    }
    
    // o routhElement, que se encontra dentro de cada um dos objetos de elements, serve para criar o
    // elemento usando roughCanvas.draw(roughElement)
  }
  
  const updateElement = (id, x1, y1, x2, y2, tool, roughConfigs) => {

    const newElements = selectedLayer.elements;
    
    switch(tool){
      case "line":
      case "rectangle":
        newElements[0] = createElement(id, x1, y1, x2, y2, tool, roughConfigs);
        break;
      case "pencil":
        newElements[0].points = [...newElements[0].points, {x: x2, y: y2}];
        break;
      default:
        throw new Error (`Tool not recognized: ${tool}`);
    }

    setSelectedLayer( selectedLayer => ({...selectedLayer, elements: newElements}));
  }

  const drawElement = (roughCanvas, context, element) => {
    switch(element.type){
      case "line":
      case "rectangle":
        roughCanvas.draw(element.roughElement);
        break;
      case "pencil":
        const stroke = getSvgPathFromStroke(getStroke(element.points, {color: "#FFFFFF"}));
        context.fillStyle = "white";
        context.fill(new Path2D(stroke));
        break;
      default:
        throw new Error(`Type not recognized: ${element.type}`);
    }
  }

  const getCanvasCoordinates = (event) => {
  
      const context = document.getElementById("canvas").getContext("2d");
    
      const mouseX = event.clientX - context.canvas.offsetLeft;
      const mouseY = event.clientY - context.canvas.offsetTop;
    
      return {mouseX, mouseY}
  }

  const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
    const a = {x: x1, y: y1};
    const b = {x: x2, y: y2};
    const c = {x, y};
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < maxDistance ? "inside" : null;
  }

  const positionWithinElement = (x, y, element) => {
    
    const { type, x1, y1, x2, y2 } = element;
    
    switch(type){
      case "line":  
        const on = onLine(x1, y1, x2, y2, x, y);
        const start = nearPoint(x, y, x1, y1, "start");
        const end = nearPoint(x, y, x2, y, "end");
        return start || end || on;
      case "rectangle":
        const topLeft = nearPoint(x, y, x1, y1, "tl");
        const topRight = nearPoint(x, y, x2, y1, "tr");
        const bottomLeft = nearPoint(x, y, x1, y2, "bl");
        const bottomRight = nearPoint(x, y, x2, y2, "br");
        const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        return topLeft || topRight || bottomLeft || bottomRight || inside;
      case "pencil":
        const betweenAnyPoint = element.points.some((point, index) => {
          const nextPoint = element.points[index + 1];
          if(!nextPoint) return false;
          return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) !== null;
        });
        return betweenAnyPoint ? "inside" : null;
      default:
        throw new Error(`Type not recognized: ${type}`);
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

  const resizedCoordinates = (mouseX, mouseY, position, coordinates) => {

    const { x1, y1, x2, y2 } = coordinates;

    switch(position){
      case "tl":
      case "start":
        return { x1: mouseX, y1: mouseY, x2, y2 };
      case "tr":
        return { x1, y1: mouseY, x2: mouseX, y2 };
      case "bl":
        return { x1: mouseX, y1, x2, y2: mouseY }
      case "br":
      case "end":
        return { x1, y1, x2: mouseX, y2: mouseY }
      default:
        return null;
    }

  }

  const getRgb = (color) => {

    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return { createElement, updateElement, drawElement, getCanvasCoordinates, getElementAtPosition, adjustElementCoordinates, cursorForPosition, resizedCoordinates}
}

export default DrawingFunctions;