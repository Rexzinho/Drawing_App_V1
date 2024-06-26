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

  return { createLayer, selectLayer, hideLayer, deleteLayer }

}

export default DrawingLayers;