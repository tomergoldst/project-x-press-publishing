const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    const sql = 'SELECT * FROM Issue WHERE Issue.id = $issueId';
    const values = {$issueId: issueId};
    db.get(sql, values, (error, issue) => {
      if (error) {
        next(error);
      } else if (issue) {
        next();
      } else {
        res.sendStatus(404);
      }
    });
  });

issuesRouter.get('/', (req, res, next) => { 
    const sql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    const values = { $seriesId: req.params.seriesId }
    db.all(sql, values, (err, rows) => {
        if (err){
            next(err);
        }  else {
            res.send({issues: rows});
        } 
    });
});

issuesRouter.post('/', (req, res, next) => {
    const issue = req.body.issue;
    const artistSql = 'SELECT * FROM Artist WHERE id = $artistId';
    const artistValues = {$artistId: issue.artistId};

    db.get(artistSql, artistValues, (err, row) => {
        if (err){
            next(err);
        } else {
            if (!issue.name || !issue.issueNumber ||
                !issue.publicationDate || !issue.artistId){
                return res.sendStatus(400);
            }

            const sql = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) 
                        VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId) `;
            const values = {
                $name: issue.name, 
                $issueNumber: issue.issueNumber, 
                $publicationDate: issue.publicationDate, 
                $artistId: issue.artistId, 
                $seriesId: req.params.seriesId
            };
            db.run(sql, values, function(err) {
                if (err){
                    next(err);
                } else {
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, 
                    (err, row) => {
                        if (err){
                            next(err)
                        } else if (!row){
                            res.sendStatus(500);
                        } else {
                            res.status(201).send({issue: row});
                        }
                    });
                }
            });
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name,
          issueNumber = req.body.issue.issueNumber,
          publicationDate = req.body.issue.publicationDate,
          artistId = req.body.issue.artistId;
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
    const artistValues = {$artistId: artistId};
    db.get(artistSql, artistValues, (error, artist) => {
      if (error) {
        next(error);
      } else {
        if (!name || !issueNumber || !publicationDate || !artist) {
          return res.sendStatus(400);
        }
  
        const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, ' +
            'publication_date = $publicationDate, artist_id = $artistId ' +
            'WHERE Issue.id = $issueId';
        const values = {
          $name: name,
          $issueNumber: issueNumber,
          $publicationDate: publicationDate,
          $artistId: artistId,
          $issueId: req.params.issueId
        };
  
        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`,
              (error, issue) => {
                res.status(200).json({issue: issue});
              });
          }
        });
      }
    });
  });
  
  issuesRouter.delete('/:issueId', (req, res, next) => {
    const sql = 'DELETE FROM Issue WHERE Issue.id = $issueId';
    const values = {$issueId: req.params.issueId};
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
  });
  
module.exports = issuesRouter;