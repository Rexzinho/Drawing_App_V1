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
    const [action, setAction] = useState("none");
    const [tool, setTool] = useState("rectangle");
    const [selectedElement, setSelectedElement] = useState();
    const [roughSets, setRoughSets] = useState({
        stroke: "#00000",
        strokeWidth: 1
    })

    return(
        <DrawingContext.Provider
            value = {{
                layers, setLayers,
                layersQty, setLayersQty,
                selectedLayer, setSelectedLayer,
                layerIndex, setLayerIndex,
                action, setAction,
                tool, setTool,
                selectedElement, setSelectedElement,
                roughSets, setRoughSets
            }}
        >
            {children}
        </DrawingContext.Provider>
    )
}

export default DrawingProvider;