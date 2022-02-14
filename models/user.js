const { Schema, model } = require('mongoose');
const { uniqueValidator } = require('mongoose-unique-validator');

const UserSchema = Schema({
    nombre: {
        type: String,
        required: true,
    },
    apellidoP: {
        type: String,
        required: true,
    },
    apellidoM: {
        type: String,
    },
    direccion: {
        type: String,
        required: true,
    },
    telefono: {
        type: Number,
        required: true,
    }
});

// UserSchema.plugin(uniqueValidator)

UserSchema.method('toJSON', function () {
    const { __v, _id,...object } = this.toObject();
    object.uid = _id;
    return object;
})

module.exports = model('User', UserSchema);
