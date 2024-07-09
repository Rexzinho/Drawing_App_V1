import { useContext, useEffect } from "react";
import { DrawingContext } from "../contexts/DrawingContext";

import DrawingFunctions from "../DrawingFunctions";
import DrawingHistory from "../DrawingHistory";

import "./TextModal.css";

const TextModal = () => {

    const { updateElement } = DrawingFunctions();
    const { updateHistory } = DrawingHistory();
    const { 
        textConfigs, setTextConfigs, 
        textModal, setTextModal, 
        selectedElements, setSelectedElements,
        setSelectedLayer, selectedLayer, layers, layerIndex
    } = useContext(DrawingContext);

    useEffect(() => {
        updateText();
    }, [textConfigs]);

    const handleText = (e) => {
        setTextConfigs(configs => ({...configs, text: e.target.value}));
    }

    const handleFontSize = (e) => {
        setTextConfigs(configs => ({...configs, fontSize: e.target.value}));
    }

    const handleFillStyle= (e) => {
        setTextConfigs(configs => ({...configs, fillStyle: e.target.value}));
    }

    const saveText = () => {
        updateText();
        setTextModal(false);
        setTextConfigs(textConfigs => ({...textConfigs, text: ""}));
        setSelectedElements([]);
        updateHistory({layers, selectedLayer, layerIndex});
    }

    const updateText = () => {
        const { id, x1, y1, x2, y2 } = selectedLayer.elements[0];
        const configs = {...textConfigs};
        updateElement(id, x1, y1, x2, y2, "text", configs);
    }

    return(
        <div className="overlay">
            <div className="modal">
                <form className="my-form">
                    <div className="form-item">
                        <label htmlFor="text">Texto: </label>
                        <input type="text" id="text" className="bg-gray1" onChange={(e) => handleText(e)} value={textConfigs.text}/>
                    </div>
                    <div className="form-item">
                        <label htmlFor="fontSize">Tamanho: </label>
                        <input type="number" min="24" max="90" value={textConfigs.fontSize} id="fontSize" className="bg-gray1" onChange={(e) => handleFontSize(e)}/>
                    </div>
                    <div className="form-color">
                        <label htmlFor="fillStyle">Cor: </label>
                        <input type="color" id="fillStyle" value={textConfigs.fillStyle} onChange={(e) => handleFillStyle(e)}/>
                    </div>
                </form>
                <div className="buttons">
                    <button className="btn-cyan" onClick={saveText}>Salvar</button>
                </div>
            </div>
        </div>
    )
}

export default TextModal;