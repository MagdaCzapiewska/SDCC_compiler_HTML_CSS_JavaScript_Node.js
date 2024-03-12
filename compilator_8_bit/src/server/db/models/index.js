module.exports.init = (db) => {
    return Promise.all([
        require('./Folder').init(db),
        require('./File').init(db),
        require('./Section').init(db),
      ]);
}