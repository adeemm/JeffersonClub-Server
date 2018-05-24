{
  "_id": "_design/events",
  "language": "javascript",
  "views": {
    "start": {
      "map": "function(doc) { emit(doc.start, { 'title': doc.title, 'start': doc.start, 'end': doc.end }); }"
    }
  }
}
