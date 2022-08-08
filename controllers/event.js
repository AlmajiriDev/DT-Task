const path = require('path')
const { mongodb, ObjectId } = require('mongodb')
const MongoClient = require("mongodb").MongoClient
const multer = require('multer')
const cors = require('cors')


// function for storing uploading image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
      },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
})

//Calls the multer function
exports.uploadImg = multer({storage: storage}).single('eventImage')

const uri = "mongodb://localhost:27017/"


const client = new MongoClient(uri)

exports.createEvent = async (req, res, next) => {
    const info = req.body
    const eventImage = req.file

    await addEvent(client, [info, eventImage])

    async function addEvent(client, newEvent){
        try {
            const result = await client
            .db("eventDB")
            .collection('eventInfo')
            .insertOne({newEvent})
    
            console.log(`Event created and added to db with the following id: ${result.insertedId}`)
            return res.status(200).json(`Successfully creared event with id: ${result.insertedId}`)
        } catch (err) {
            return res.err({message: err})
        }
    }

}

//get the event with the given id
exports.getEventById = async (req, res, next) => {
    var requestedEventId = req.params._id
    const paramsPassed = ObjectId(requestedEventId)


    await eventFinder(client, paramsPassed)

    async function eventFinder(client, requestedId){
        const result = await client
        .db("eventDB")
        .collection('eventInfo')
        .findOne({
            _id: ObjectId(requestedId)
            })
        // const result = await client.db("eventDB").collection('eventInfo').findOne({"_id": requestedId})
        if(result){
            console.log(result)
            console.log(`${result._id}`)
            // console.log(`Found event with id ${requestedId}`)
            return res.status(201).json({event: result})            
        }   
        console.log(`No event with id ${requestedId} found`)
        return res.status(404).json({message: "Event not found"})
    }

}

//gets events and paginate
exports.getEventAndPaginate = async (req, res, next) => {
    const eventType = parseInt(req.query.type)
    const eventsPerPage = parseInt(req.query.limit)
    // const type = toString(req.query.type)
    const page = req.query.page || 0


    let events = []
    
    await client
        .db("eventDB")
        .collection('eventInfo')
        .find().sort({_id: 1})
        .skip(page * eventsPerPage)
        .limit(eventsPerPage || 2)
        .forEach(event => events.push(event))
        .then((result) => {
            console.log(events)
            return res.status(201).json(events)
        })
        .catch((err)=>{
            console.log(`You have reached the end of the list of events`)
            return res.status(400).json({error: err})
        })   
    }


//finds and update events whose id is passed in the paremeter
exports.updateEventById = async (req, res, next) => {
    var requestedEventId = req.params._id
    const paramsPassed = ObjectId(requestedEventId)
    let updatedEvent = req.body

    await eventUpdater(client, paramsPassed, updatedEvent)

    async function eventUpdater(client, requestedId, updatedEvent){
        const result = await client
        .db("eventDB")
        .collection('eventInfo')
        .updateOne(
            {_id: ObjectId(requestedId)}, {$set: updatedEvent}
            )
        if(result){
            console.log(`${result.matchedCount} document(s) matched the query criteria`)
            console.log(`${result.modifiedCount} document(s) was/were updated`)
            return res.status(201).json({event: result})            
        }   
        console.log(`No event with id ${requestedId} found`)
        return res.status(500).json({message: "Event not found"})
    }

}




//deletes event whose id is passed in the parameter
exports.deleteEventById = async (req, res, next) => {
    var requestedEventId = req.params._id
    const paramsPassed = ObjectId(requestedEventId)
   
    let updatedEvent = req.body

    await eventUpdater(client, paramsPassed, updatedEvent)

    async function eventUpdater(client, requestedId){
        const result = await client.db("eventDB").collection('eventInfo').deleteOne({_id: ObjectId(requestedId)})
        if(result){
            console.log(`${result.matchedCount} document(s) matched the query criteria`)
            console.log(`${result.modifiedCount} document(s) was/were deleted`)
            return res.status(201).json({event: result})            
        }   
        console.log(`No event with id  ${requestedId} found`)
        return res.status(404).json({message: "Event not found"})
    }

}





