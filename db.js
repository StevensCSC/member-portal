import pg from 'pg';
import bluebird from 'bluebird';
import logger from './logger.js';

var client;

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function (err, c) {
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

export function getSuggestionsForUser(user) {
  return new Promise((resolve, reject) => {
    client.query("SELECT suggestion_id, title, link, description, suggester," +
                    "(SELECT count(*) FROM votes WHERE suggestion_id = suggestion.suggestion_id) as votes," +
                    "(SELECT case when count(*) > 0 then TRUE else FALSE end FROM votes WHERE voter = $1 AND suggestion_id = suggestion.suggestion_id) as userUpvoted FROM suggestions as suggestion",
    [user],
    function(err, result) {
      if (err) {
        reject(err);
      }

      resolve(result.rows);
    });
  });
}

export function upvoteSuggestionForUser(suggestionId, user) {
  return new Promise((resolve, reject) => {
    client.query("INSERT INTO votes (suggestion_id, voter) VALUES ($1, $2)",
     [suggestionId, user],
     function (err, result) {
      if (err) {
        reject(err);
      }

      resolve();
     });
  });
}

export function resetVoteSuggestionForUser(suggestionId, user) {
   return new Promise((resolve, reject) => {
    client.query("DELETE FROM votes WHERE suggestion_id = $1 AND voter = $2",
     [suggestionId, user],
     function (err, result) {
      if (err) {
        reject(err);
      }

      resolve();
     });
  });
}
