const Casella = require('./models/Casella');
const mongoose = require('mongoose');
require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log("Connesso a MongoDB");

    const caselle = [];
    for(let i=1;i<=24;i++){
        caselle.push({
            ID: i,
            Descrizione: `Descrizione casella ${i}`,
            Attiva: false,
            Completata: false
        });
    }

    await Casella.insertMany(caselle);
    console.log("Caselle inserite nel DB");
    mongoose.disconnect();
})
.catch(err => console.error(err));