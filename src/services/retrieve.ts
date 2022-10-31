import axios from "axios"

const API_URL = "http://localhost:8080/sibi/"

const retrieveListVideo = (sentence: string)=>{
    return axios.get(`${API_URL}list/${sentence}`).then(response=>response.data);
}

export default {
    retrieveListVideo
}