import express from "express"
import cors from "cors"
import tests from "./api/tests.route.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/v1/test", tests)
app.use("*", (req, res) => res.status(404).json({error: "Not Found"}))

export default app
