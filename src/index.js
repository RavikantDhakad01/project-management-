import dotenv from "dotenv"
import app from "./app.js"
import connectDb from "./db/index.js"

dotenv.config({
    path: "./.env"
});

const port = process.env.PORT || 3000

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`Sever is listening on port: ${port}`)
    })
}).catch((error) => {
    console.error("Mongo connection error", error)
    process.exit(1)
})


