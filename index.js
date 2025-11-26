const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 🔥 Connessione al DB MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connesso a MongoDB!'))
.catch(err => console.error('Errore connessione MongoDB:', err));

//---------------------------------------------------------------------------------------------------------------------------
// Schema Mongoose per le caselle
const casellaSchema = new mongoose.Schema({
    ID: Number,
    Attiva: { type: Boolean, default: false },
    Completata: { type: Boolean, default: false },
});

const Casella = mongoose.model('Casella', casellaSchema, 'caselle');

// GET tutte le caselle attive
app.get("/api/caselle", async (req, res) => {
    try {
        const result = await Casella.find({ Attiva: true });
        console.log(result);
        res.json(result);
    } catch (err) {
        console.error("Errore MongoDB:", err);
        res.status(500).json({ error: "Errore recupero caselle" });
    }
});

// POST per segnare una casella come completata
app.post("/api/casella_completata", async (req, res) => {
    try {
        const { id } = req.body;
        console.log("ID ricevuto:", id);

        const result = await Casella.updateOne({ ID: id }, { $set: { Completata: true } });
        console.log(result);

        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error("Errore MongoDB:", err);
        res.status(500).json({ error: "Errore aggiornamento casella" });
    }
});

// Funzione per aggiornare la casella del giorno
const aggiornaCasellaDelGiorno = async () => {
    const today = new Date();
    const day = today.getDate(); // 1,2,...31
    const month = today.getMonth(); // 0=Gennaio, 11=Dicembre

    if (month !== 11) { // 11 = Dicembre
        console.log("Non è dicembre, nessuna casella attivata.");
        return;
    }

    try {
        const result = await Casella.updateOne({ ID: day }, { $set: { Attiva: true } });
        console.log(`Casella ID=${day} attivata:`, result.modifiedCount);
    } catch (err) {
        console.error("Errore aggiornamento casella:", err);
    }
};

// Esegue ogni giorno a mezzanotte
cron.schedule('0 0 * * *', () => {
    console.log("🔥 Aggiornamento casella giornaliera...");
    aggiornaCasellaDelGiorno();
});

// Test API
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Ciao dal backend!' });
});

app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));




cron.schedule('45 9 * * *', () => {
    aggiorna();
});

// Funzione per aggiornare la casella del giorno
const aggiorna = async () => {
    try {
        const result = await Casella.updateMany({}, { $set: { Attiva: true } });
    } catch (err) {
        console.error("Errore aggiornamento casella:", err);
    }
};