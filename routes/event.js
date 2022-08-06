const express = require("express")
const router = express.Router()
const eventController = require('../controllers/event')

router.post('/events', eventController.uploadImg, eventController.createEvent)
// router.get('/events',  eventController.getEventById)
router.get('/events', eventController.getEventAndPaginate)
router.put('/events/:_id', eventController.updateEventById)
router.delete('/events/:_id', eventController.deleteEventById)


module.exports = router

