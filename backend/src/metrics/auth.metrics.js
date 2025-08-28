const client = require('prom-client');

const authMetrics = {
  loginSuccess: new client.Counter({ name: 'auth_login_success_total', help: 'Successful login attempts' }),
  loginFailure: new client.Counter({ name: 'auth_login_failure_total', help: 'Failed login attempts' }),
  refreshSuccess: new client.Counter({ name: 'auth_refresh_success_total', help: 'Successful refresh token exchanges' }),
  refreshFailure: new client.Counter({ name: 'auth_refresh_failure_total', help: 'Failed refresh token exchanges' }),
  logout: new client.Counter({ name: 'auth_logout_total', help: 'Logout operations' }),
  lockoutTriggered: new client.Counter({ name: 'auth_lockout_triggered_total', help: 'Account lockouts triggered' }),
  lockoutBlocked: new client.Counter({ name: 'auth_lockout_blocked_total', help: 'Login attempts blocked due to active lockout' }),
  passwordResetRequested: new client.Counter({ name: 'auth_password_reset_requested_total', help: 'Password reset requests (valid user)' }),
  passwordResetCompleted: new client.Counter({ name: 'auth_password_reset_completed_total', help: 'Successful password resets' }),
  passwordResetFailed: new client.Counter({ name: 'auth_password_reset_failed_total', help: 'Failed password reset attempts' }),
};

module.exports = authMetrics;
