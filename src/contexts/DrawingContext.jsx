import { useState, createContext } from 'react';

export const DrawingContext = createContext({});

const DrawingProvider = ({children}) => {

    const [layers, setLayers] = useState([{}]);
    const [layersQty, setLayersQty] = useState(1);

    const [selectedLayer, setSelectedLayer] = useState({
        name: `Layer-${layersQty}`,
        id: layersQty,
        elements: [],
        hidden: false
    });

    const [layerIndex, setLayerIndex] = useState(0);
    const [selectedElements, setSelectedElements] = useState([]);
    const [action, setAction] = useState("none");
    const [tool, setTool] = useState("text");

    const [history, setHistory] = useState([{
        layers: [{
          name: `Layer-${layersQty}`,
          id: layersQty,
          elements: [],
          hidden: false
        }],
        selectedLayer: {
          name: `Layer-${layersQty}`,
          id: layersQty,
          elements: [],
          hidden: false
        },
        layerIndex: 0,
    }]);

    const [historyIndex, setHistoryIndex] = useState(0);

    const [textConfigs, setTextConfigs] = useState({
        text: "",
        font: "Comic Sans MS",
        fontSize: 24,
        fillStyle: "#FFFFFF",
    });

    const [textModal, setTextModal] = useState(false);

    return(
        <DrawingContext.Provider
            value = {{
                layers, setLayers,
                layersQty, setLayersQty,
                selectedLayer, setSelectedLayer,
                layerIndex, setLayerIndex,
                action, setAction,
                tool, setTool,
                history, setHistory,
                historyIndex, setHistoryIndex,
                textConfigs, setTextConfigs,
                textModal, setTextModal,
                selectedElements, setSelectedElements
            }}
        >
            {children}
        </DrawingContext.Provider>
    )
}

export default DrawingProvider;