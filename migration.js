const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {           
    db.run("DROP TABLE IF EXISTS Artist");
    db.run(`CREATE TABLE Artist (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        biography TEXT NOT NULL,
        is_currently_employed INTEGER DEFAULT 1
    )`);
});

db.serialize(() => {           
    db.run("DROP TABLE IF EXISTS Series");
    db.run(`CREATE TABLE Series (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description  TEXT NOT NULL
    )`);
});

db.serialize(() => {           
    db.run("DROP TABLE IF EXISTS Issue");
    db.run(`CREATE TABLE Issue (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        issue_number TEXT NOT NULL,
        publication_date TEXT NOT NULL,
        artist_id INTEGER NOT NULL,
        series_id INTEGER NOT NULL
    )`);
});