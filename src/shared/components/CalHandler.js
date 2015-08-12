import React, { PropTypes } from 'react'
import Cal from './CalComponent'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as PostActions from '../actions/PostActions'
import { updateTitle } from '../actions/LocaleActions'
import DocumentTitle from './addon/document-title'
import moment from 'moment'

@connect(state => ({
  post: state.post
}))
export default class CalHandler extends React.Component {

  constructor (props, context) {
    super(props, context)
    const date = moment(new Date()).startOf('day').valueOf()
    const dispatch = context.store.dispatch
    dispatch(PostActions.countPostsWithCal())
    dispatch(PostActions.fetchList(0, 10, date, null, true))
    dispatch(updateTitle('title.cal'))
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  static async routerWillRun ({ dispatch }) {
    const date = moment(new Date()).startOf('day').valueOf()
    await dispatch(PostActions.countPostsWithCal())
    return await dispatch(PostActions.fetchList(0, 10, date, null, true))
  }

  render () {
    const _t = require('counterpart')
    const { dispatch } = this.props
    return (
      <DocumentTitle title={_t('title.cal')}>
        <Cal
          {...this.props}
          {...bindActionCreators(PostActions, dispatch)}
        />
      </DocumentTitle>
    )
  }
}
