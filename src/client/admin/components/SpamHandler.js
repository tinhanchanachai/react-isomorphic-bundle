import React, { PropTypes } from 'react'
import Spam from './SpamComponent'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as PostActions from 'client/admin/actions/PostActions'
import * as AuthActions from 'client/admin/actions/AuthActions'

@connect(state => ({
  auth: state.auth,
  collect: state.post
}))
export default class SpamHandler extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    collect: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props)
    const { dispatch } = props
    dispatch(PostActions.fetchList({ offset: 0, limit: 8, status: 1 }))

    this.state = { page: { selected: 0 } }
  }

  handlePageClick (page) {
    const { dispatch, collect } = this.props
    const c = page.selected * collect.limit
    this.setState({ page: page })

    return dispatch(PostActions.fetchList({
      offset: c,
      limit: collect.limit,
      status: 1,
      keyword: collect.keyword
    }))
  }

  markAsUnSpam (checked) {
    const { dispatch } = this.props
    const form = {
      spam: checked,
      type: 'unspam'
    }

    return dispatch(PostActions.markAsSpam(form)).then(() => {
      return this.handlePageClick(this.state.page)
    })
  }

  render () {
    const { dispatch } = this.props
    return (
      <Spam
        {...bindActionCreators(AuthActions, dispatch)}
        {...bindActionCreators(PostActions, dispatch)}
        handlePageClick={::this.handlePageClick}
        action={::this.markAsUnSpam}
        {...this.props}
      />
    )
  }
}
