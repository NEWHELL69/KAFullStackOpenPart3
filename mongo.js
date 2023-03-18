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

main()
async function main() {

    const password = process.argv[2]
    const name = process.argv[3]
    const number = process.argv[4]

    // MongoDB URL
    const url = `mongodb+srv://kushagra0304:${password}@clusterstocksheet.gifewxy.mongodb.net/?retryWrites=true&w=majority`
    mongoose.set('strictQuery',false)

    await mongoose.connect(url);

    const contactSchema = new mongoose.Schema({
        name: String,
        number: "number",
    })
      
    const Contact = mongoose.model('Contact', contactSchema)
    
    const contact = new Contact({
        name: name,
        number: number
    })

    if(process.argv.length === 5){
        const newContact = await contact.save();

        if(newContact === contact){
            console.log(`Added ${newContact.name} number ${newContact.number} to phonebook.`);
        }

    } else if(process.argv.length === 3){
        console.log("Phonebook:")
        const contacts = await Contact.find({});

        contacts.forEach(contact => {
            console.log(`${contact.name} ${contact.number}`);
        });

    }

    mongoose.connection.close()
}