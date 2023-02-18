const express = require('express')
const morgan = require('morgan')
const fs = require('fs');
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

const fileName = './persons.json';
let persons = require(fileName);

const range = 1000;

app.get('/api/persons', (request, response) => {
    response.json(persons)
}) 

app.get('/info', (request, response) => {
    response.render('index', {enteriesCount: `Phonebook has info for ${persons.length} people`, currentDate: `${new Date().toString()}` })
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find((person) => {
        return person.id === id
    })

    if(person === undefined) {
        response.status(404).end();
        return;
    }

    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    fs.writeFile(fileName, JSON.stringify(persons, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(persons));
        console.log('writing to ' + fileName);
    });

    response.status(204).end()
})

const generateId = () => {
    let id = Math.floor(Math.random() * range);

    while(persons.find((person) => {
        return person.id === id
    }) !== undefined) {
        id = Math.floor(Math.random() * range);
    }

    return id;
}
  
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
    } else if(persons.find((person) => {
        return person.name === body.name
    }) !== undefined) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person);

    fs.writeFile(fileName, JSON.stringify(persons, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(persons));
        console.log('writing to ' + fileName);
    });


    response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})