import cors from "cors"
import express from "express"
import { checkConfig } from "./iot_comm.js"

const app = express()
app.use(express.json())

const corsOptions = {
  origin: '*', // Permite todas as origens (pode ser configurado para origens específicas)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos permitidos
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'], // Cabeçalhos permitidos
};

app.use(cors(corsOptions))

const port = 80

app.get("/sendConfig", async (req, res) => {
  sendConfig(req, res)
})

app.listen(port, () => console.log("Server is running on port:", port))