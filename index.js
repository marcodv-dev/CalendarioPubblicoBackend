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
        const result = await Casella.find({ Attiva: true }).sort({ ID: 1 });
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

    if (month !== 11) {
        console.log("Non è dicembre, nessuna casella attivata.");
        return { day, month, updated: false };
    }

    try {
        const result = await Casella.updateOne(
            { ID: day },
            { $set: { Attiva: true } }
        );

        console.log(`Casella ID=${day} attivata:`, result.modifiedCount);

        return { day, updated: result.modifiedCount > 0 };

    } catch (err) {
        console.error("Errore aggiornamento casella:", err);
        return { day, updated: false, error: true };
    }
};


app.get('/cron/aggiorna', async (req, res) => {
    try {
        const result = await aggiornaCasellaDelGiorno();
        res.json(result); // 👈 risponde con il day rilevato
    } catch (e) {
        res.status(500).send("Errore");
    }
});


app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));

app.get("/api/time", (req, res) => {
    res.json({ serverTime: new Date().toString() });
});


