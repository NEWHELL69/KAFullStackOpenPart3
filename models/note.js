const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI

console.log(typeof url)

console.log("Connecting to MongoDB");

mongoose.connect(url).then((_) => {
    console.log("Connection successfull")
}).catch((e) => {
    console.log("Error connecting to MongoDB:", e.message)
});

const contactSchema = new mongoose.Schema({
    name: String,
    number: "number",
})

contactSchema.set('toJSON', {
    transform: (document, returnedObject, options) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

exports.convertStringIdToObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
}

exports.getModel = () => {
    return mongoose.model('Contact', contactSchema);
}

exports.getConnectionReadyState = () => {
    return mongoose.connection.readyState;
}

