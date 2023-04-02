require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');

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

const myMongoose = require("./models/note.js")
const Contact = myMongoose.getModel()

function handleDataBaseConnection(request, response, next) {
    if(myMongoose.getConnectionReadyState() !== 1) {
        response.status(503).json({
            error: "Database not connected"
        })
    } else {
        next();
    }
}

app.use(handleDataBaseConnection)

app.get('/api/persons', (request, response, next) => {
    Contact.find({}).then(contacts => {
        response.json(contacts)
    }).catch((e) => {
        next(e)
    })
})

app.get('/info', (request, response) => {
    Contact.countDocuments({}).then((count) => {
        response.render('index', {enteriesCount: `Phonebook has info for ${count} people`, currentDate: `${new Date().toString()}` })
    }).catch((e) => {
        next(e)
    })
})

app.get('/api/persons/:id', (request, response) => {
    let id = request.params.id;

    Contact.findById(id).then((contact) => {
        if(contact){
            response.json(contact)
        } else{
            response.status(404).end()
        }
    }).catch((e) => {
        next(e)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = myMongoose.convertStringIdToObjectId(request.params.id)

    Contact.deleteOne(id).then((obj) => {
        if(obj.acknowledged) {
            console.log("Deletion successfull")
        }
    }).catch((e) => {
        next(e)
    })

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

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
    }).catch((e) => {
        next(e)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id

   if(!body.number) {
        return response.status(400).json({ 
            error: 'number missing' 
        })
    }

    const updationTocontact = {
        name: body.name,
        number: body.number    
    }

    Contact.findByIdAndUpdate(id, updationTocontact, {new: true})
        .then((newContact) => {
            console.log(`Added ${newContact.name} number ${newContact.number} to phonebook.`);
            
            response.json(newContact)
        }).catch((e) => {
            next(e)
        })
})

const errorHandler = (error, request, response, next) => {
    console.error(error)

    if (error.name === 'BSONError') {
        return response.status(400).send({ error: 'malformatted id' })
    } 

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted obj values provided' })
    } 

    next(error)
}
  
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})