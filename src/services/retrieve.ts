import axios from "axios"

const API_URL = process.env.REACT_APP_SERVICE_URL;

const retrieveListVideo = (sentence: string)=>{
    return axios.get(`${API_URL}list/${sentence}`).then(response=>response.data);
}

export default {
    retrieveListVideo
}