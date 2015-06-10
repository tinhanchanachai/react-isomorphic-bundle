'use strict';

const bcrypt = require('co-bcrypt');
const hashids = require('src/shared/utils/hashids-plus');
const models = require('src/server/db/models');

exports.create = function *(user) {
  const fillable = ['email', 'name', 'passwd', 'status'];
  const salt = yield bcrypt.genSalt(10);
  user.passwd = yield bcrypt.hash(user.password, salt);
  user.status = 0;

  return yield models.users.create(user, {fields: fillable});
};

exports.load = function *(hid) {
  const id = +hashids.decode(hid);
  return yield models.users.findOne({
    where: {id: id}
  });
};

exports.update = function *(hid, user) {
  const fillable = ['name', 'passwd'];
  const id = +hashids.decode(hid);
  const salt = yield bcrypt.genSalt(10);
  user.passwd = yield bcrypt.hash(user.password, salt);
  let u = yield models.users.findOne({
    where: {id: id}
  });
  return yield u.update(user, {fields: fillable});
};

exports.delete = function *(hid) {
  const id = +hashids.decode(hid);
  let user = yield models.users.findOne({where: {id: id}});
  return yield user.destroy();
};

exports.auth = function *(email, password) {
  const user = yield models.users.findOne({
    where: {email: email}
  });

  if (!user) {
    return false;
  }
  if (!user.passwd) {
    return false;
  }
  if (email !== user.email) {
    return false;
  }

  const pass = yield bcrypt.compare(password, user.passwd);
  if (pass) {
    return user;
  }
  else {
    return null;
  }
};