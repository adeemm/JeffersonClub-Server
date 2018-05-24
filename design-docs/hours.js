module.exports = {
  hours: {
    views: {
      date: function(doc) {
        emit(doc.date, { 'title': doc.title, 'desc': doc.desc, 'hours': doc.hours, 'date': doc.date });
      }
    }
  }
};

// {
//   "_id": "_design/hours",
//   "language": "javascript",
//   "views": {
//     "date": {
//       "map": "function(doc) { emit(doc.date, { 'title': doc.title, 'desc': doc.desc, 'hours': doc.hours, 'date': doc.date }); }"
//     }
//   }
// }
