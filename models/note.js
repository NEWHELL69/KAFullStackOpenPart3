const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log(typeof url)

console.log("Connecting to MongoDB");

mongoose.connect(url).then((_) => {
    console.log("Connection successfull")
}).catch((e) => {
    console.log("Error connecting to MongoDB:", e.message)
});

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, 'User name required']
    },
    number: {
        type: String,
        validate:{
            validator: function (value) {
                return /\d{2}-\d{6,}/.test(value) || /\d{3}-\d{5,}/.test(value)
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
    }
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

