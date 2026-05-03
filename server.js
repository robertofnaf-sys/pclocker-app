require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Crear la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,     // Antes era DB_HOST
    user: process.env.MYSQLUSER,     // Antes era DB_USER
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE, // Antes era DB_NAME
    port: process.env.MYSQLPORT
});

db.connect(err => {
    if(err) throw err;
    console.log('✅ Conectado a MySQL');
});

// ==========================================
// RUTAS DE INVENTARIO
// ==========================================
app.get('/api/equipos', (req, res) => {
    db.query('SELECT * FROM equipos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/equipos', (req, res) => {
    const { id, name, hardware, qty } = req.body;
    const query = `INSERT INTO equipos (id, name, hardware, qty) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE qty = qty + ?`;
    db.query(query, [id, name, hardware, qty, qty], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Equipo guardado' });
    });
});

app.delete('/api/equipos/:id', (req, res) => {
    db.query('DELETE FROM equipos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Equipo eliminado' });
    });
});

// Actualizar stock manual
app.put('/api/equipos/:id/stock', (req, res) => {
    db.query('UPDATE equipos SET qty = qty + ? WHERE id = ?', [req.body.change, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Stock actualizado' });
    });
});

// ==========================================
// RUTAS DE USUARIOS
// ==========================================
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT id, username, password, role, approved FROM usuarios', (err, results) => {
        if (err) return res.status(500).json(err);
        const formattedUsers = results.map(u => ({ ...u, approved: u.approved === 1 }));
        res.json(formattedUsers);
    });
});

app.post('/api/usuarios', (req, res) => {
    const { id, username, password, role, approved } = req.body;
    db.query('INSERT INTO usuarios (id, username, password, role, approved) VALUES (?, ?, ?, ?, ?)', 
    [id, username, password, role, approved ? 1 : 0], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Usuario creado' });
    });
});

app.put('/api/usuarios/:id/approve', (req, res) => {
    db.query('UPDATE usuarios SET approved = 1 WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Usuario aprobado' });
    });
});

app.put('/api/usuarios/:id/password', (req, res) => {
    db.query('UPDATE usuarios SET password = ? WHERE id = ?', [req.body.password, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Contraseña actualizada' });
    });
});

app.delete('/api/usuarios/:id', (req, res) => {
    db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Usuario eliminado' });
    });
});

// ==========================================
// RUTAS DE PRÉSTAMOS
// ==========================================
app.get('/api/prestamos', (req, res) => {
    db.query('SELECT id, username, pc_id as pcId, status FROM prestamos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/prestamos', (req, res) => {
    const { username, pcId, status } = req.body;
    db.query('INSERT INTO prestamos (username, pc_id, status) VALUES (?, ?, ?)', [username, pcId, status], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Préstamo registrado' });
    });
});

app.put('/api/prestamos/:id', (req, res) => {
    db.query('UPDATE prestamos SET status = ? WHERE id = ?', [req.body.status, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Estado actualizado' });
    });
});

// ==========================================
app.listen(3000, () => {
    console.log('🚀 Servidor API corriendo en el puerto 3000');
});