import request from 'superagent'
import { isEmpty } from 'lodash'
import {
  AUTH_USER_STARTED,
  AUTH_USER_COMPLETED,
  AUTH_USER_FAILED,
  REVOKE_USER_COMPLETED,
  REVOKE_USER_FAILED,
  SYNC_SERVER_USER_COMPLETED,
  SYNC_CLIENT_USER_COMPLETED,
  CHECK_TOKEN_COMPLETED,
  CHECK_TOKEN_FAILED
} from 'shared/constants/ActionTypes'
import jwtDecode from 'jwt-decode'

export function save (token) {
  return async dispatch => {
    dispatch({ type: AUTH_USER_STARTED })
    try {
      setToken(token)
      return dispatch({
        type: AUTH_USER_COMPLETED,
        token: token
      })
    } catch (err) {
      return dispatch({
        type: AUTH_USER_FAILED,
        errors: err.message
      })
    }
  }
}

export function sync (token) {
  return async dispatch => {
    if (typeof document !== 'undefined')
      return dispatch({
        type: SYNC_CLIENT_USER_COMPLETED,
        token: getToken()
      })
    else
      return dispatch({
        type: SYNC_SERVER_USER_COMPLETED,
        token: token
      })
  }
}

export function login (form) {
  return async dispatch => {
    dispatch({ type: AUTH_USER_STARTED })
    try {
      const res = await auth(form)
      if (res && res.token) {
        setToken(res.token)
        return dispatch({
          type: AUTH_USER_COMPLETED,
          token: res.token
        })
      } else throw new Error('no token')
    } catch (err) {
      return dispatch({
        type: AUTH_USER_FAILED,
        errors: err.message
      })
    }
  }
}

export function logout () {
  return async dispatch => {
    try {
      const res = await revoke()
      if (res && res.revoke) {
        clearToken()
        return dispatch({
          type: REVOKE_USER_COMPLETED
        })
      } else throw new Error('revoke error')

    } catch (err) {
      return dispatch({
        type: REVOKE_USER_FAILED,
        errors: err.message
      })
    }
  }
}

export function setToken (token) {
  if (typeof localStorage !== 'undefined'
      && localStorage !== null)
    if (token && token !== 'undefined')
      localStorage.setItem('token', token)
}

export function getToken () {
  let token = ''
  if (typeof localStorage !== 'undefined'
      && localStorage !== null)
    token = localStorage.getItem('token')

  return token
}

export function checkToken () {   // just check token expire field
  return async dispatch => {
    try {
      const decoded = jwtDecode(getToken())
      const now = Math.round(+new Date() / 1000)  // Unix Timestamp
      const expired = decoded.exp <= now

      if (!expired)
        return dispatch({
          type: CHECK_TOKEN_COMPLETED,
          verified: true
        })
      else
        throw new Error('verification failed')

    } catch (err) {
      return dispatch({
        type: CHECK_TOKEN_FAILED,
        errors: err.message
      })
    }
  }
}

export function clearToken () {
  if (typeof localStorage !== 'undefined'
      && localStorage !== null)
    localStorage.setItem('token', '')
}

export async function auth (form) {
  return new Promise((resolve, reject) => {
    request
      .post('/api/v1/login')
      .set('Accept', 'application/json')
      .auth(form.email, form.password)
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

export async function verify () {
  return new Promise((resolve, reject) => {
    request
      .post('/auth/token/verify')
      .set('Accept', 'application/json')
      .send({ token: getToken() })
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

export async function revoke () {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/logout')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        if (!err && res.body)
          resolve(res.body)
        else
          reject(err)
      })
  })
}

