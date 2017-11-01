module.exports = (app) => {
    app.use('/api/user', require('./apis/user/index.js'));
    app.use('/api/song', require('./apis/song/index.js'));
    app.use('/api/playlist', require('./apis/playlist/index.js'));
}
