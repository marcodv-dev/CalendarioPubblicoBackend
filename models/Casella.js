const mongoose = require('mongoose');

const casellaSchema = new mongoose.Schema({
    ID: { type: Number, required: true, unique: true },
    Descrizione: { type: String, required: true },
    Attiva: { type: Boolean, default: false },
    Completata: { type: Boolean, default: false }
});

const Casella = mongoose.model('Casella', casellaSchema, 'caselle');

module.exports = Casella;