import express from "express"

const app =express()

app.get("/",(req,res)=>{
    res.send("This is home page")
})
app.get("/login",(req,res)=>{
    res.end("This is login page")
})
export default app