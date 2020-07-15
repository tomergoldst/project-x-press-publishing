const express = require('express');
const artistRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.param('artistId', (req, res, next, artistId) => {
    const sql = 'SELECT * FROM Artist WHERE id = $artistId';
    const values = {$artistId: artistId};
    db.get(sql, values, (err, row) => {
        if (err){
            next(err);
        } else if (!row) {
            res.sendStatus(404);
        } else {
            req.artist = row;
            next();
        }
    });
});

artistRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1',
    (err, rows) => {
        if (err){
            next(err);
        }  else {
            res.send({artists: rows});
        } 
    });
})

artistRouter.get('/:artistId', (req, res, next) => {
    res.send({artist: req.artist});
});

artistRouter.post('/', (req, res, next) => {
    const artist = req.body.artist;
    if (!artist.name || !artist.dateOfBirth || !artist.biography){
        return res.sendStatus(400);
    }

    if (!artist.isCurrentlyEmployed){
        artist.isCurrentlyEmployed = 1;
    }

    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
        VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`,
        {
            $name: artist.name, 
            $dateOfBirth: artist.dateOfBirth, 
            $biography: artist.biography, 
            $isCurrentlyEmployed: artist.isCurrentlyEmployed
        },
        function(err) {
            if (err){
                next(err);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, 
                (err, row) => {
                    if (err){
                        next(err)
                    } else if (!row){
                        res.sendStatus(500);
                    } else {
                        res.status(201).send({artist: row});
                    }
                });
            }
        })
});

artistRouter.put('/:artistId', (req, res, next) => {
    const artist = req.body.artist;
    if (!artist.name || !artist.dateOfBirth || !artist.biography){
        return res.sendStatus(400);
    }

    db.run(`UPDATE Artist
        SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed
        WHERE Artist.id = $artistId`,
    {
        $name: artist.name, 
        $dateOfBirth: artist.dateOfBirth, 
        $biography: artist.biography, 
        $isCurrentlyEmployed: artist.isCurrentlyEmployed,
        $artistId: req.params.artistId
    },
    function(err) {
        if (err){
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, 
            (err, row) => {
                if (err){
                    next(err)
                } else if (!row){
                    res.sendStatus(500);
                } else {
                    res.send({artist: row});
                }
            });
        }
    });
});

artistRouter.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist
    SET is_currently_employed = 0
    WHERE Artist.id = $artistId`,
    {
        $artistId: req.params.artistId
    },
    function(err) {
        if (err){
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, 
            (err, row) => {
                if (err){
                    next(err)
                } else if (!row){
                    res.sendStatus(500);
                } else {
                    res.send({artist: row});
                }
            });
        }
    });
});

module.exports = artistRouter;
