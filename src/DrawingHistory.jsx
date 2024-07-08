import { useContext, useState } from "react";
import { DrawingContext } from "./contexts/DrawingContext";

const DrawingHistory = () => {

    const {
        layers, setLayers,
        selectedLayer, setSelectedLayer,
        layerIndex, setLayerIndex,
        layersQty,
        history, setHistory,
        historyIndex, setHistoryIndex
    
    } = useContext(DrawingContext);

    const updateHistory = (newHistory) => {

        const latestHistory = history[history.length-1];

        if(historyIndex !== history.length-1){
            const historySliced = [...history].slice(0, historyIndex + 1);
            setHistory([...historySliced, newHistory]);
            setHistoryIndex(index => index + 1);
            return;
        }
        if(JSON.stringify(latestHistory.layers) !== JSON.stringify(newHistory.layers)){
            const newHistory2 = [...history, newHistory];
            setHistory(newHistory2);
            setHistoryIndex(index => index + 1);
        }
    }
    
    const changeHistory = value => {
        if(
        (historyIndex === 0 && value === -1) || 
        (historyIndex === history.length-1 && value === 1)
        ) return;

        const newHistory = history[historyIndex + value];

        setLayers(newHistory.layers);
        setSelectedLayer(newHistory.selectedLayer);
        setLayerIndex(newHistory.layerIndex);
        setHistoryIndex(index => index + value);
        console.log(history);
    }
    
    const undo = () => changeHistory(-1);
    const redo = () => changeHistory(+1);

    return {updateHistory, undo, redo}
}

export default DrawingHistory;