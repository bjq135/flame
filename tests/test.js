'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const host = 'http://127.0.0.1:3000';
const headers = new Headers();
headers.append('Content-Type', 'application/json');

test('auth', async function (t) {
  await t.test('required account work fine with undefined', async () => {
    let url = host + '/v1/auth/login';
    let payload = { password:'123456'};

    let response = await fetch(url,{ method:'POST', headers, body: JSON.stringify(payload)});
    let json = await response.json();
    assert.deepEqual(json, { error: 'account is required' });
  });
  
  await t.test('incorrect username or password', async () => {
    let url = host + '/v1/auth/login';
    let payload = { account:'test@qq.com', password:'123456' };
  
    let response = await fetch(url,{ method:'POST', headers, body: JSON.stringify(payload)});
    let json = await response.json();
    assert.deepEqual(json, { error: 'incorrect username or password' });
  });


});