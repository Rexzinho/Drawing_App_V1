import { useContext, useEffect } from 'react';
import { DrawingContext } from './contexts/DrawingContext';

import DrawingHistory from './DrawingHistory';

const DrawingLayers = () => {
  
  const {
    layers, setLayers,
    layersQty, setLayersQty,
    selectedLayer, setSelectedLayer,
    layerIndex, setLayerIndex,

  } = useContext(DrawingContext);

  const { updateHistory } = DrawingHistory();

  const createLayer = () => {

    setLayerIndex(0);
    const newLayersQty = layersQty + 1;
    setLayersQty(newLayersQty);

    const newLayer = {
      name: `Layer-${newLayersQty}`,
      id: newLayersQty,
      elements: [],
      hidden: false
    }
    
    setSelectedLayer(newLayer);
    const newLayers = [newLayer, ...layers]
    setLayers(newLayers);

    updater(newLayers, newLayer, 0);
  }

  const selectLayer = (id) => {

    layers.map((layer, index) => {
      if(layer.id === id){
        setSelectedLayer(layers[index]);
        setLayerIndex(index);
        return;
      }
    });

  }

  const hideLayer = (index) => {

    const newLayer = {...layers[index], hidden: !layers[index].hidden}
    const newLayers = [...layers];
    newLayers[index] = newLayer;
    setLayers(newLayers);

    if(layerIndex === index){
      const newSelectedLayer = {...selectedLayer, hidden: !selectedLayer.hidden};
      setSelectedLayer(newSelectedLayer);
      updater(newLayers, newSelectedLayer, layerIndex);
      return;
    }

    updater(newLayers, selectedLayer, layerIndex);
  }

  const deleteLayer = (id) => {

    if(layers.length === 1) return;

    const layersCopy = [...layers];
    const newLayers = layersCopy.filter(layerCopy => layerCopy.id !== id);
    setLayers(newLayers);

    const newIndex = layerIndex === 0 ?  0 : layerIndex - 1;
    const newSelectedLayer = newLayers[newIndex];
    setSelectedLayer(newSelectedLayer);
    setLayerIndex(newIndex);

    updater(newLayers, newSelectedLayer, newIndex);
  }

  const upLayer = (id) => {

    if(layerIndex === 0 || layers.length === 1) return;

    const newLayers = [...layers];
    [newLayers[layerIndex], newLayers[layerIndex - 1]] = 
    [newLayers[layerIndex - 1], newLayers[layerIndex]];

    setLayers(newLayers);
    setLayerIndex(layerIndex - 1);

    updater(newLayers, selectedLayer, layerIndex - 1);
  }

  const downLayer = (id) => {
  
    if(layerIndex === layers.length - 1 || layers.length === 1) return;

    const newLayers = [...layers];
    [newLayers[layerIndex], newLayers[layerIndex + 1]] = 
    [newLayers[layerIndex + 1], newLayers[layerIndex]];

    setLayers(newLayers);
    setLayerIndex(layerIndex + 1);

    updater(newLayers, selectedLayer, layerIndex + 1);
  }

  const updater = (newLayers, newSelectedLayer, newLayerIndex) => {
    const newHistory = {
      layers: newLayers,
      selectedLayer: newSelectedLayer,
      layerIndex: newLayerIndex
    }
    updateHistory(newHistory);
  }

  return { createLayer, selectLayer, hideLayer, deleteLayer, upLayer, downLayer }

}

export default DrawingLayers;