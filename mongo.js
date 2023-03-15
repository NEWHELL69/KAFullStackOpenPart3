// High level API for mongoDB 
const mongoose = require('mongoose')

// The node command below executes this file and saves a new contact with the info provided as arguments
// node <filename> <password> <name> <number>
// Filename - Name of this file
// Password - Password to authenticate the mongoDB cluster.
// Name - Name of the contact
// Number - Number of the contact
if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

// MongoDB URL
const url = `mongodb+srv://kushagra0304:${password}@clusterstocksheet.gifewxy.mongodb.net/?retryWrites=true&w=majority`
mongoose.set('strictQuery',false)

// 
const contactSchema = new mongoose.Schema({
  name: String,
  number: "number",
})

const Contact = mongoose.model('Contact', contactSchema)

const contact = new Contact({
  name: name,
  number: number
})

mongoose.connect(url).then(() => {
    //Code below should work outside of this callback but it isn't working. The issue is the callback in the save 
    // function below timeouts before mongoose can connect to the cluster.

    if(process.argv.length === 5){
        contact.save().then(result => {
            console.log(`added ${name} number ${number} to phonebook`)

            mongoose.connection.close()
        })
    } else if(process.argv.length === 3){
        console.log("Phonebook:")
        Contact.find({}).then(contacts => {
            contacts.forEach(contact => {
                console.log(`${contact.name} ${contact.number}`);
            });

            mongoose.connection.close()
        })
    }
})