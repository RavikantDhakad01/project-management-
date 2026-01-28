import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
});

let userName=process.env.App_USERNAME
console.log("Usename:",userName);