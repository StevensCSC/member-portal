import $ from 'jquery';

let API_URL = process.env.NODE_ENV === 'production' ? 'http://scsc-memberportal.herokuapp.com/' : 'http://localhost:3000/';

export default class ServerAPI {

  static upvote(id, onSuccess, onFailure) {
    $.get({
      url: API_URL + id + "/upvote",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static resetVote(id, onSuccess, onFailure) {
    $.get({
      url: API_URL + id + "/resetVote",
      xhrFields: { withCredentials: true }, dataType: "json",
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static submit(json, onSuccess, onFailure) {
    $.post({
      url: API_URL + "submit",
      xhrFields: { withCredentials: true },
      dataType: "json",
      data: json,
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static userPermissions(onSuccess, onFailure) {
    console.log('API_URL:' + API_URL);
    $.get({
      url: API_URL + "userPermissions",
      xhrFields: { withCredentials: true },
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static getSuggestionsForCurrentUser(onSuccess, onFailure) {
    $.get({
      url: API_URL + "getSuggestionsForCurrentUser",
      xhrFields: { withCredentials: true },
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static getUserRole(onSuccess, onFailure) {
    $.get({
      url: API_URL + "getUserRole",
      xhrFields: { withCredentials: true },
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static deleteSuggestion(id, onSuccess, onFailure) {
    $.ajax({
        url: API_URL + id + "/delete",
        type: 'DELETE',
        xhrFields: { withCredentials: true },
        success: (data) => onSuccess(data),
        error: (data) => onFailure(data)
      });
  }

  static archiveSuggestion(id, onSuccess, onFailure) {
    $.get({
        url: API_URL + id + "/archive",
        xhrFields: { withCredentials: true },
        success: (data) => onSuccess(data),
        error: (data) => onFailure(data)
      });
  }

  static logout(onSuccess, onFailure) {
    $.get({
      url: API_URL + "logout",
      xhrFields: { withCredentials: true },
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

}
