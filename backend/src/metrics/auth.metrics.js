const client = require('prom-client');

const authMetrics = {
  loginSuccess: new client.Counter({ name: 'auth_login_success_total', help: 'Successful login attempts' }),
  loginFailure: new client.Counter({ name: 'auth_login_failure_total', help: 'Failed login attempts' }),
  refreshSuccess: new client.Counter({ name: 'auth_refresh_success_total', help: 'Successful refresh token exchanges' }),
  refreshFailure: new client.Counter({ name: 'auth_refresh_failure_total', help: 'Failed refresh token exchanges' }),
  logout: new client.Counter({ name: 'auth_logout_total', help: 'Logout operations' }),
};

module.exports = authMetrics;
