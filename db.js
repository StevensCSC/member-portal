import redis from 'redis';
import bluebird from 'bluebird';
import logger from './logger.js';

var client;
bluebird.promisifyAll(redis.RedisClient.prototype);

export function setClient(newClient) {
  client = newClient;

  client.on('error', (err) => {
    logger.error('REDIS ERROR: ' + err);
  }).on('ready', () => {
    logger.info('REDIS READY');
  });
}

export function createSuggestion(suggestion, then, err) {
  return new Promise((resolve, reject) => {
    client.incr('next_suggestion_id', (err, suggestion_id) => {
      if (!err) {
        suggestion.id = suggestion_id;
        client.hmset("suggestion:" + suggestion_id, suggestion);
        client.sadd("suggestions", "suggestion:" + suggestion_id);
        client.sadd("suggestion:" + suggestion_id + ":votes", suggestion.suggester);
        getSuggestionsForUser(suggestion.suggester)
          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            logger.error("Failed to get suggestions for " + suggestion.suggester + ". Error: " + err);
            reject(err);
          });
      } else {
        reject(err);
      }
    });
  });
}

export function getSuggestionsForUser(user) {
  return new Promise((resolve, reject) => {
    client.smembers('suggestions', (err, results) => {
      if (!err) {
        let suggestionPromises = results.map((suggestionId) => {
          return client.hgetallAsync(suggestionId);
        });

        Promise.all(suggestionPromises)
          .then((suggestions) => {
            let suggestionWithCountPromises = suggestions.map((suggestion) => {
              return new Promise((resolve, reject) => {
                client.scardAsync("suggestion:" + suggestion.id + ":votes")
                  .then((voteCount) => {
                    client.sismemberAsync("suggestion:" + suggestion.id + ":votes", user)
                      .then((userUpvoted) => {
                        suggestion.voteCount = voteCount;
                        suggestion.userUpvoted = userUpvoted == 1;
                        resolve(suggestion);
                      })
                      .catch((err) => {
                        reject(err);
                      });
                  })
                  .catch((err) => {
                    reject(err);
                  });
              });
            });

            Promise.all(suggestionWithCountPromises)
              .then((suggestionsWithCount) => {
                resolve(suggestionsWithCount);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(err);
      }
    });
  });
}

export function upvoteSuggestionForUser(suggestionId, user) {
  return new Promise((resolve, reject) => {
    client.saddAsync('suggestion:' + suggestionId + ':votes', user)
      .then((result) => {
        getSuggestionsForUser(user)
          .then((suggestions) => {
            resolve(suggestions);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function resetVoteSuggestionForUser(suggestionId, user) {
   return new Promise((resolve, reject) => {
    client.sremAsync('suggestion:' + suggestionId + ':votes', user)
      .then((result) => {
        getSuggestionsForUser(user)
          .then((suggestions) => {
            resolve(suggestions);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
