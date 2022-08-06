const express = require("express")
const app = express()
const MongoClient = require("mongodb").MongoClient
const eventRoute = require('./routes/event')
// const bodyParser = require('body-parser')


//parse the body to json
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())



//using localhost
const uri = "mongodb://localhost:27017/"


const client = new MongoClient(uri)
async function run() {
  try {
    const db = client.db('eventDB')
    console.log("connected to eventDB") 
  } finally {
    await client.close()
  }
}
run().catch(console.dir)


app.use('/api/v3/app', eventRoute )



app.listen(3000, function () {
  console.log("Server started on port 3000")
})