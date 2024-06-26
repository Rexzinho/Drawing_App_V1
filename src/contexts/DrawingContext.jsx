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
    const [tool, setTool] = useState("select");
    const [selectedElement, setSelectedElement] = useState();

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
            }}
        >
            {children}
        </DrawingContext.Provider>
    )
}

export default DrawingProvider;