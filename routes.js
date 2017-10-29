module.exports = (app) => {
    app.use('/api/user', require('./apis/user/index.js'));
}
