import axios from "axios"

const server = axios.create({
  baseURL: "ENDPOINT_DA_API:PORTA",
}) 

export default server