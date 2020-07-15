const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = 'SELECT * FROM Series WHERE id = $seriesId';
    const values = {$seriesId: seriesId};
    db.get(sql, values, (err, row) => {
            if (err){
                next(err);
            } else if (!row) {
                res.sendStatus(404);
            } else {
                req.series = row;
                next();
            }
    });
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series',
    (err, rows) => {
        if (err){
            next(err);
        }  else {
            res.send({series: rows});
        } 
    });
})

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.send({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const series = req.body.series;
    if (!series.name || !series.description){
        return res.sendStatus(400);
    }

    const sql = `INSERT INTO Series (name, description) VALUES ($name, $description)`;
    const values = {
        $name: series.name, 
        $description: series.description
    };

    db.run(sql, values, function(err) {
        if (err){
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, 
            (err, row) => {
                if (err){
                    next(err)
                } else if (!row){
                    res.sendStatus(500);
                } else {
                    res.status(201).send({series: row});
                }
            });
        }
    })
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const series = req.body.series;
    if (!series.name || !series.description){
        return res.sendStatus(400);
    }

    const sql = `UPDATE Series 
                SET name = $name, description = $description 
                WHERE Series.id = $seriesId`;
    const values = {
        $name: series.name, 
        $description: series.description,
        $seriesId: req.params.seriesId
    }

    db.run(sql, values, function(err) {
        if (err){
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, 
            (err, row) => {
                if (err){
                    next(err)
                } else if (!row){
                    res.sendStatus(500);
                } else {
                    res.send({series: row});
                }
            });
        }
    });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    const issueValues = {$seriesId: req.params.seriesId};
    db.get(issueSql, issueValues, (error, issue) => {
      if (error) {
        next(error);
      } else if (issue) {
        res.sendStatus(400);
      } else {
        const deleteSql = 'DELETE FROM Series WHERE Series.id = $seriesId';
        const deleteValues = {$seriesId: req.params.seriesId};
  
        db.run(deleteSql, deleteValues, (error) => {
          if (error) {
            next(error);
          } else {
            res.sendStatus(204);
          }
        });
      }
    });
  });

module.exports = seriesRouter;