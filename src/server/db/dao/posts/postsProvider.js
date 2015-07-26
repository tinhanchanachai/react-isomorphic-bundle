'use strict'

import models from 'src/server/db/models'
import hashids from 'src/shared/utils/hashids-plus'
import moment from 'moment'
import { pluck, range, compact, reduce } from 'lodash'

const Sequelize = models.Sequelize
const Post = models.posts

exports.create = function *(post) {
  const fillable = [
    'uid',
    'type',
    'prop',
    'startDate',
    'endDate',
    'openDate',
    'closeDate',
    'title',
    'content',
    'file',
    'lat',
    'lng',
    'place'
  ]

  return yield Post.create(post, { fields: fillable })
}

exports.load = function *(hid) {
  const id = +hashids.decode(hid)
  return yield Post.findOne({
    where: { id: id }
  })
}

/* eslint-disable camelcase */
exports.list = function *(offset=0, limit=20) {
  return yield Post.findAll({
    offset: offset,
    limit: limit,
    order: [[ 'start_date', 'ASC' ]],
    where: {
      end_date: {
        $gte: new Date(moment().endOf('day'))
      }
    }
  })
}

/* eslint-disable camelcase */
exports.fetch = function *(offset=0, limit=20, start, end) {
  let _start = start
  let _end = end

  if (typeof _start === 'undefined')
    _start = moment().endOf('day').valueOf()
  else
    _start = +_start
  if (typeof _end === 'undefined')
    _end = moment(+_start).endOf('day').valueOf()
  else
    _end = +_end


  return yield Post.findAll({
    offset: offset,
    limit: limit,
    order: [[ 'start_date', 'ASC' ]],
    where: {
      end_date: {
        $gte: new Date(moment(_start))
      }
    }
  })
}

/* eslint-disable camelcase */
exports.countPerDayInMonth = function *(year, month) {
  let out = []
  let _year = year
  let _month = month
  let totalDays

  if (typeof _year !== 'undefined' && typeof _month !== 'undefined')
    totalDays = moment({
      year: _year,
      month: _month - 1,
      day: 1
    }).endOf('month').date()
  else {
    totalDays = moment().endOf('month').date()
    _year = moment().year()
    _month = moment().month() + 1
  }

  let items = yield Post.findAll({
    attributes: [
      'startDate',
      'endDate'
    ],
    order: [[ 'start_date', 'ASC' ]],
    where: {
      start_date: {
        $between: [
          new Date(moment({
            year: _year,
            month: _month - 1,
            day: 1
          }).startOf('day')),
          new Date(moment({
            year: _year,
            month: _month - 1,
            day: totalDays
          }).endOf('day'))
        ]
      }
    },
    raw: true
  })


  items.forEach(item => {
    let start = moment(new Date(item.startDate)).date()
    let _diff = moment(new Date(item.endDate))
      .diff(new Date(item.startDate), 'days')

    if (_diff > 0)
      for (let i of range(start, start + _diff))
        if (typeof out[i] === 'undefined')
          out[i] = 1
        else
          out[i] = out[i] + 1
    else
      if (typeof out[start] === 'undefined')
        out[start] = 1
      else
        out[start] = out[start] + 1
  })

  // Total in this month
  out[0] = reduce(compact(out), (sum, n) => sum + n )

  return out
}

/* eslint-disable camelcase, max-len */
exports.countWithStartDay = function *(start, end) {
  let _start = +start
  let _end = +end

  return yield Post.findAll({
    attributes: [
      () => {
        const dialect = models.sequelize.options.dialect
        if (dialect === 'sqlite')
          return [
            Sequelize.fn('DATE', Sequelize.col('start_date')),
            'date'
          ]
        else if (dialect === 'mysql')
          return [
            Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m-%d'),
            'date'
          ]
        else if (dialect === 'mssql')
          return [
            Sequelize.fn('CONVERT', 'CHAR(10)', Sequelize.col('start_date'), '126'),
            'date'
          ]
      }(),
      [
        Sequelize.fn('count', moment(Sequelize.col('start_date')).format('YYYY-MM-DD')),
        'total'
      ]
    ],
    order: [[ 'start_date', 'ASC' ]],
    where: {
      start_date: {
        $between: [
          moment.utc(_start).subtract('1', 'days').format(),
          moment.utc(_end).format()
        ]
      }
    },
    group: ['date']
  })
}

function date_format (date, fm) {
  return moment(date).format(fm)
}

exports.update = function *(hid, post) {
  const fillable = [
    'type',
    'prop',
    'start_date',
    'end_date',
    'open_date',
    'close_date',
    'title',
    'content'
  ]
  const id = +hashids.decode(hid)
  let p = yield Post.findOne({
    where: { id: id }
  })
  return yield p.update(post, { fields: fillable })
}

exports.delete = function *(hid) {
  const id = +hashids.decode(hid)
  let post = yield Post.findOne({ where: { id: id } })
  return yield post.destroy()
}

exports.updateGeo = function *(hid, geo) {
  const fillable = [
    'lat',
    'lng',
    'country',
    'city',
    'place',
    'zipcode',
    'address'
  ]
  const id = +hashids.decode(hid)
  let p = yield Post.findOne({
    where: { id: id }
  })
  return yield p.update(geo, { fields: fillable })
}

exports.updateAttachments = function *(hid, attach) {
  const fillable = [ 'url', 'img', 'file' ]
  const id = +hashids.decode(hid)
  let p = yield Post.findOne({
    where: { id: id }
  })
  return yield p.update(attach, { fields: fillable })
}
