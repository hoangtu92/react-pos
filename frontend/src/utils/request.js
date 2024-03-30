import axios from 'axios'

const httpRequest = axios.create({
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
})

export default httpRequest
