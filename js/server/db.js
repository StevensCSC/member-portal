import pg from 'pg';
import bluebird from 'bluebird';
import logger from './logger.js';

var client;

function getConfig() {
  if(process.env.NODE_ENV === 'production') {
    pg.defaults.ssl = true; return process.env.DATABASE_URL;
  } else {
    return {
      database: 'scsc_db',
    };
  }
}

pg.connect(getConfig(), function (err, c) {
  if (err) {
    logger.error("Error connecting to PostgreSQL:" + err);
  } else {
    client = c;
  }
});

function suggestionToSQLArray(suggestion) {
  return [
    suggestion.title,
    suggestion.link,
    suggestion.desc,
    suggestion.suggester
  ];
}

export function createSuggestion(suggestion, then, err) {
  return new Promise((resolve, reject) => {
    client.query('INSERT INTO suggestions (title, link, description, suggester)' +
      'VALUES ($1, $2, $3, $4)',
      suggestionToSQLArray(suggestion),
      function (err, result) {
        if (err) {
          reject(err);
        }

        resolve();
      });
  });
}

export function getSuggestionsForUser(userId) {
  return new Promise((resolve, reject) => {
    client.query("SELECT suggestion_id, title, link, description, suggester," +
                    "(SELECT count(*) FROM votes WHERE suggestion_id = suggestion.suggestion_id) as votes," +
                    "(SELECT case when count(*) > 0 then TRUE else FALSE end FROM votes WHERE voter = $1 AND suggestion_id = suggestion.suggestion_id) as userUpvoted FROM suggestions as suggestion ORDER BY votes DESC",
    [userId],
    function(err, result) {
      if (err) {
        console.log(err);
        reject(err);
      }

      resolve(result.rows);
    });
  });
}

export function upvoteSuggestionForUser(suggestionId, userId) {
  return new Promise((resolve, reject) => {
    client.query("INSERT INTO votes (suggestion_id, voter) VALUES ($1, $2)",
     [suggestionId, userId],
     function (err, result) {
      if (err) {
        reject(err);
      }

      resolve();
     });
  });
}

export function resetVoteSuggestionForUser(suggestionId, userId) {
   return new Promise((resolve, reject) => {
    client.query("DELETE FROM votes WHERE suggestion_id = $1 AND voter = $2",
     [suggestionId, userId],
     function (err, result) {
      if (err) {
        reject(err);
      }

      resolve();
     });
  });
}

export function deleteSuggestion(suggestionId) {
  return new Promise((resolve, reject) => {
    client.query("DELETE FROM suggestions WHERE suggestion_id = $1",
      [suggestionId],
      function (err, result) {
        if (err) {
          reject(err);
        }

        resolve();
      });
  });
}

export function archiveSuggestion(suggestionId) {
  return new Promise((resolve, reject) => {
    client.query("WITH moved_rows AS (" +
                    "DELETE FROM suggestions WHERE suggestion_id = $1 RETURNING suggestions.*)" +
                    "INSERT INTO archived_suggestions SELECT * FROM moved_rows;",
      [suggestionId],
      function (err, result) {
        if (err) {
          reject(err);
        }

        resolve();
      });
  });
}
