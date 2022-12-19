import app from "./server.js"
import dotenv from "dotenv"


dotenv.config()

const port = process.env.PORT

app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})