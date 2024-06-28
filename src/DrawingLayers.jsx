import { useContext } from 'react';

import { DrawingContext } from './contexts/DrawingContext';

const DrawingLayers = () => {
  
  const {
    layers, setLayers,
    layersQty, setLayersQty,
    selectedLayer, setSelectedLayer,
    layerIndex, setLayerIndex,

  } = useContext(DrawingContext);

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

  const hideLayer = (index) => {

    console.log(index);
    const newLayer = {...layers[index], hidden: !layers[index].hidden}
    const newLayers = [...layers];
    newLayers[index] = newLayer;
    setLayers(newLayers);

    if(layerIndex === index)
      setSelectedLayer(selectedLayer => ({...selectedLayer, hidden: !selectedLayer.hidden}));
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
  }

  const upLayer = (id) => {

    if(layerIndex === 0 || layers.length === 1) return;

    const newLayers = [...layers];
    [newLayers[layerIndex], newLayers[layerIndex - 1]] = 
    [newLayers[layerIndex - 1], newLayers[layerIndex]];

    setLayers(newLayers);
    setLayerIndex(layerIndex - 1);
  }

  const downLayer = (id) => {
  
    if(layerIndex === layers.length - 1 || layers.length === 1) return;

    const newLayers = [...layers];
    [newLayers[layerIndex], newLayers[layerIndex + 1]] = 
    [newLayers[layerIndex + 1], newLayers[layerIndex]];

    setLayers(newLayers);
    setLayerIndex(layerIndex + 1);
  }

  return { createLayer, selectLayer, hideLayer, deleteLayer, upLayer, downLayer }

}

export default DrawingLayers;