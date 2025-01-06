import languages from "../languages/languages"
import {getLocalStorageSettings, updateLocalStorageSettings} from "./localStorage";


const trans = (key) => {
    let settings = getLocalStorageSettings();
    if(settings === null) settings = {};
    if(typeof settings.language === "undefined" || settings.language === "" || settings.language == null){
        settings.language = "tw";
        updateLocalStorageSettings(settings);
    }
    const ln = {"en": 0, "tw": 1};
    return languages[key][ln[settings.language]];
}
export default trans;
