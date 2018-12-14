require('module-alias/register');

const app = require('@root/app');

app.httpServer.listen(app.httpPort);
app.log.info(`Server started on: http://${app.host}:${app.httpPort}`);
