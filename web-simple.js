const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('students.sqlite');

// Crear la tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT
)`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// GET & POST /students
app.route('/students')
    .get((req, res) => {
        db.all("SELECT * FROM students", [], (err, rows) => {
            if (err) {
                res.status(500).send("Database error");
            } else {
                const students = rows.map(row => ({
                    id: row.id,
                    firstname: row.firstname,
                    lastname: row.lastname,
                    gender: row.gender,
                    age: row.age
                }));
                res.json(students);
            }
        });
    })
    .post((req, res) => {
        const { firstname, lastname, gender, age } = req.body;
        const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
        db.run(sql, [firstname, lastname, gender, age], function(err) {
            if (err) {
                res.status(500).send("Error inserting student");
            } else {
                res.send(`Student with id: ${this.lastID} created successfully`);
            }
        });
    });

// GET, PUT, DELETE /student/:id
app.route('/student/:id')
    .get((req, res) => {
        db.get("SELECT * FROM students WHERE id = ?", [req.params.id], (err, row) => {
            if (err) {
                res.status(500).send("Database error");
            } else if (!row) {
                res.status(404).send("Student not found");
            } else {
                res.json(row);
            }
        });
    })
    .put((req, res) => {
        const { firstname, lastname, gender, age } = req.body;
        const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;
        db.run(sql, [firstname, lastname, gender, age, req.params.id], function(err) {
            if (err) {
                res.status(500).send("Error updating student");
            } else {
                res.json({ id: req.params.id, firstname, lastname, gender, age });
            }
        });
    })
    .delete((req, res) => {
        const sql = `DELETE FROM students WHERE id = ?`;
        db.run(sql, [req.params.id], function(err) {
            if (err) {
                res.status(500).send("Error deleting student");
            } else {
                res.send(`The Student with id: ${req.params.id} has been deleted.`);
            }
        });
    });

app.listen(8000, () => {
    console.log('Server running on http://0.0.0.0:8000');
});
