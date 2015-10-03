import React, { PropTypes } from 'react'
import { BaseComponent } from 'shared/components'
import GMap from 'shared/components/addon/maps/gmap'
import { isEmpty } from 'lodash'
import moment from 'moment'
import {
  toMoment,
  isBetween,
  isPastDay,
  toShortDate,
  toYear
} from 'shared/utils/date-utils'
import { getFileName, getFileExt } from 'shared/utils/file-utils'
import classNames from 'classnames'
import { PostPropArray } from 'shared/utils/forms'
import { at } from 'lodash'
import counterpart from 'counterpart'
import { Link } from 'react-router'
import { fixLocaleName, originLocaleName } from 'shared/utils/locale-utils'
import AutoLinkText from 'react-autolink-text'
import createLocation from 'history/lib/createLocation'
import ADContent from './ADContent'
import Carousel from 'nuka-carousel'
import { Lightbox } from 'shared/components/addon/lightbox'

export default class Post extends BaseComponent {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    map: PropTypes.object.isRequired,
    remove: PropTypes.func.isRequired,
    defaultLocale: PropTypes.string.isRequired
  }

  static contextTypes = {
    history: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props, context)

    counterpart.setLocale(props.defaultLocale)

    this.state = {
      locale: fixLocaleName(counterpart.getLocale())
    }

    counterpart.onLocaleChange(::this.handleLocaleChange)
    this.releaseTimeout = undefined
  }

  componentWillUnmount () {
    if (this.op) {
      clearTimeout(this.releaseTimeout)
    }
  }

  removeTags (html) {
    const pattern = /(<([^>]+)>)/ig;
    return html.replace(pattern , '')
  }

  parseContent (content) {
    const ent = require('ent')
    if (content) {
      return (
        content.replace(/^\"|\"$/g, '').split('\n').map((t) => {
          return t === ''
            ? <br />
            : <p><AutoLinkText text={ent.decode(this.removeTags(t))}/></p>
        })
      )
    }
  }

  deletePost () {
    const _t = require('counterpart')
    const { detail } = this.props.post
    const { remove } = this.props
    const { transitionTo } = this.context.history
    swal({
      title: _t('post.detail.delete.title'),
      text: _t('post.detail.delete.text'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: _t('post.detail.delete.confirm'),
      cancelButtonText: _t('post.detail.delete.cancel'),
      closeOnConfirm: false,
      showLoaderOnConfirm: true
    }, () => {
      Promise.all([
        remove(detail.id)
      ]).then(() => {
        swal({
          title: _t('post.detail.delete.ok.title'),
          text: _t('post.detail.delete.ok.text'),
          type: 'success',
          confirmButtonText: _t('post.detail.delete.ok.confirm'),
          closeOnConfirm: true
        }, () => {
          transitionTo(createLocation('/w'))
        })
      })
    })
  }

  handleImgClick (src, event) {
    Lightbox.show(
      <img src={src} />
    )
  }

  handleLocaleChange () {
    this.forceUpdate()
  }

  renderDetailProp (detail) {
    return (
      <span>
        {at(PostPropArray(originLocaleName(counterpart.getLocale())), detail.prop)}
      </span>
    )
  }

  renderRegisterInfo (detail) {
    if (!detail.url) return <div></div>

    const Translate = require('react-translate-component')
    const open = toMoment(detail.openDate)
    const close = toMoment(detail.closeDate)
    const now = moment()

    if (now.isBetween(open, close)) {
      return (
        <div className="register-info">
          <div className="ui hidden divider"></div>
          <a className="ui fluid large orange button"
            href={detail.url} target="_blank">
            <Translate content="post.detail.open" />
          </a>
        </div>
      )
    } else if (now.isAfter(close)) {
      return (
        <div className="register-info">
          <div className="ui hidden divider"></div>
          <div className="ui secondary center aligned segment">
            <Translate content="post.detail.close" />
          </div>
        </div>
      )
    }
  }

  renderImageAttachments () {
    const { detail } = this.props.post
    const files = typeof detail.file !== 'undefined'
      ? JSON.parse(detail.file)
      : []

    const imgs = []
    files && files.map(function (file) {
      if (getFileExt(file) !== 'pdf') {
        imgs.push(file)
      }
    })
    if (!isEmpty(imgs)) {
      return (
        <div className="ui basic segment">
          <Carousel cellAlign="center" slideWidth="300px">
          {
            imgs.map(function (link) {
              if (getFileExt(link) !== 'pdf') {
                const src = '/uploads/' + link
                return (
                  <a
                    className="carousel"
                    onClick={this.handleImgClick.bind(this, src)}>
                    <img src={src} />
                  </a>
                )
              } else {
                return (<div />)
              }
            }.bind(this))
          }
          </Carousel>
        </div>
      )
    }

    return (
      <div />
    )
  }

  /* eslint-disable max-len */
  render () {
    console.log(this.props.map)
    const Translate = require('react-translate-component')

    if (!isEmpty(this.props.post.errors)) {
      return (
        <main className="ui two column post detail stackable has-header grid container">
          <div className="column">
            <div className="ui huge orange ribbon label">
              <Translate content="post.detail.noexist" />
            </div>
          </div>
        </main>
      )
    } else {
      const { detail } = this.props.post
      const { content } = detail
      const files = typeof detail.file !== 'undefined'
        ? JSON.parse(detail.file)
        : []

      const detailClass = classNames('content', { hide: !detail.id })

      const finalContent = this.parseContent(content)

      const eventDate = (detail.startDate === detail.endDate)
      ? toShortDate(detail.endDate)
      : toShortDate(detail.startDate) + ' - ' + toShortDate(detail.endDate)

      let eventEndYear =
        toYear(detail.endDate) > toYear(new Date())
        ? toYear(detail.endDate)
        : null

      const eventStartYear =
        toYear(detail.startDate) < toYear(new Date())
        ? toYear(detail.startDate)
        : null

      if (eventStartYear && toYear(detail.endDate) === toYear(new Date())) {
        eventEndYear = <Translate content="post.detail.this_year" />
      }

      let mainClasses
      if (!detail.lat || !detail.lat) {
        mainClasses = classNames(
          'ui',
          'two',
          'column',
          'post',
          'detail',
          'stackable',
          'has-header',
          'grid',
          'container'
        )
      }

      return (
        <main
          className={mainClasses}>
          <div className="column">
            <div className="row">
              <div id="lightbox-container" />
            </div>
            <div className="row">
              <div className="ui fluid detail card">
                {this.props.post.isFetching && !detail.id &&
                <div className="ui segment basic has-header">
                  <div className="ui active inverted dimmer">
                    <div className="ui large loader"></div>
                  </div>
                </div>
                }
                <div className={detailClass}>
                  <div className="ui left floated">
                  {eventDate && (
                      <span className="ui large orange ribbon label">
                        {eventDate}
                      </span>
                    )}
                  </div>
                  <div className="ui large right floated">
                    {eventStartYear && (
                      <span className="ui right ribbon label">
                        {eventStartYear}
                        { eventEndYear
                          && <Translate content="post.detail.start" /> }
                      </span>
                    )}
                    {eventEndYear && (
                      <div>
                        <span className="ui large teal right ribbon label">
                          <Translate content="post.detail.end" /> {eventEndYear}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ui hidden divider" />
                  <h1 className="title">
                    {detail.title}
                  </h1>
                  <div className="description">
                    {finalContent}
                    { files && !isEmpty(files)
                      &&
                      <h4 className="ui horizontal divider header">
                        <Translate content="post.detail.attachments" />
                      </h4> }
                    <ul className="fileList">
                    {
                      files && !isEmpty(files)
                      && files.map(function (file, i) {
                        return (
                          <li
                            key={i}>
                            <div
                              className="ui teal label"
                              data-filetype={getFileExt(file)}>
                              <a
                                className="ui teal button"
                                target="_blank"
                                href={'/uploads/' + file}>
                                <div >
                                  <div className="fileName">
                                    { getFileName(file) }
                                  </div>
                              </div>
                              </a>
                            </div>
                          </li>
                        )
                      })
                    }
                    </ul>
                  </div>
                  <div className="taglist right aligned">
                    <span
                      className="ui large tag label category">
                      {this.renderDetailProp(detail)}
                    </span>
                  </div>
                </div>
                {!isEmpty(detail.uid) && this.props.auth.user.id === detail.uid &&
                <div className="extra content">
                  <div className="ui two buttons">
                    <Link
                      className="ui basic green button"
                      to={`/post/${detail.id}/edit`}>
                      <Translate content="post.detail.edit" />
                    </Link>
                    <a
                      className="ui basic red button"
                      onClick={::this.deletePost}>
                      <Translate content="post.detail.delete.confirm" />
                    </a>
                  </div>
                </div>
                }
              </div>
            </div>
            <div className="row">
              {this.renderRegisterInfo(detail)}
            </div>
          </div>
          <div className="map column">
            <div className="row">
              { this.renderImageAttachments() }
            </div>
            <div className="row">
              { (detail.lat && detail.lat) &&
              <GMap
                ref="gmap"
                {...this.props.map}
                defaultLocale={this.props.defaultLocale}
              />
              }
            </div>
            <div className="row">
              <ADContent />
            </div>
          </div>
        </main>
      )
    }
  }
}
