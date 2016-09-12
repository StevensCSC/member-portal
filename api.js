import $ from 'jquery';

export default class ServerAPI {

  static upvote(id, onSuccess, onFailure) {
    $.get({
      url: "http://localhost:3000/" + id + "/upvote",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static resetVote(id, onSuccess, onFailure) {
    $.get({
      url: "http://localhost:3000/" + id + "/resetVote",
      xhrFields: { withCredentials: true },
      dataType: "json",
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static submit(json, onSuccess, onFailure) {
    $.post({
      url: "http://localhost:3000/" + "submit",
      xhrFields: { withCredentials: true },
      dataType: "json",
      data: json,
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

  static userPermissions(onSuccess, onFailure) {
    $.get({
      url: "http://localhost:3000/" + "userPermissions",
      xhrFields: { withCredentials: true },
      success: (data) => onSuccess(data),
      error: (data) => onFailure(data)
    });
  }

}
