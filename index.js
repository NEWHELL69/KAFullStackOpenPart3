require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose')

const app = express()

app.set('views', './views')
app.set('view engine', 'pug')

app.use(cors());
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
    if(tokens.method(req, res) === "POST") {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            JSON.stringify(req.body)
        ].join(' ');
    }

    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
}))

const fileName = './persons.json';
let persons = require(fileName);

const range = 1000;

const myMongoose = require("./models/note.js")
const Contact = myMongoose.getModel()

app.get('/api/persons', (request, response) => {
    if(myMongoose.getConnectionReadyState() !== 1) {
        response.status(503).json({
            error: "Database not connected"
        })
    }

    Contact.find({}).then(contacts => {
        response.json(contacts)
    })
})

app.get('/info', (request, response) => {
    if(myMongoose.getConnectionReadyState() !== 1) {
        response.status(503).json({
            error: "Database not connected"
        })
    }

    Contact.countDocuments({}).then((count) => {
        response.render('index', {enteriesCount: `Phonebook has info for ${count} people`, currentDate: `${new Date().toString()}` })
    }).catch((e) => {
        console.log(e)
    })
})

app.get('/api/persons/:id', (request, response) => {
    let id = request.params.id;

    if(myMongoose.getConnectionReadyState() !== 1) {
        response.status(503).json({
            error: "Database not connected"
        })
    }

    Contact.findById(id).then((contact) => {
        response.json(contact)
    }).catch((e) => {
        console.log(e)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = myMongoose.convertStringIdToObjectId(request.params.id)

    Contact.deleteOne(id).then((obj) => {
        if(obj.acknowledged) {
            console.log("Deletion successfull")
        }
    }).catch((e) => {
        console.log(e)
    })

    response.status(204).end()
})

// const generateId = () => {
//     let id = Math.floor(Math.random() * range);

//     while(persons.find((person) => {
//         return person.id === id
//     }) !== undefined) {
//         id = Math.floor(Math.random() * range);
//     }

//     return id;
// }
  
app.post('/api/persons', (request, response) => {
    const body = request.body
    let errorMsg;

    if (!body.name) {
        return response.status(400).json({ 
        error: 'name missing' 
        })
    } else if(!body.number) {
        return response.status(400).json({ 
        error: 'number missing' 
        })
    }

    const contact = new Contact({
        name: body.name,
        number: body.number    
    })

    contact.save().then((newContact) => {
        if(newContact === contact){
            console.log(`Added ${newContact.name} number ${newContact.number} to phonebook.`);
            response.json(newContact)
        }    
    })
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})