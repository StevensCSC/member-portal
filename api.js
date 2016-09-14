import $ from 'jquery';

let API_URL = "http://localhost:3000/"

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

}
