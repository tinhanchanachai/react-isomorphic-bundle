import React, { PropTypes } from 'react'
import PostDetail from './PostDetailComponent'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as AuthActions from '../actions/AuthActions'
import * as PostActions from '../actions/PostActions'
import * as MapActions from '../actions/MapActions'
import * as LocaleActions from '../actions/LocaleActions'
import DocumentTitle from './addon/document-title'
import { BaseComponent } from 'shared/components'

class PostDetailHandler extends BaseComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired,
    translator: PropTypes.object
  }

  constructor (props, context) {
    super(props, context)
    const { dispatch, resolver, getState } = context.store

    this.authActions = bindActionCreators(AuthActions, dispatch)
    this.postActions = bindActionCreators(PostActions, dispatch)
    this.mapActions = bindActionCreators(MapActions, dispatch)
    this.localeActions = bindActionCreators(LocaleActions, dispatch)

    resolver.resolve(this.postActions.prepare)
    resolver.resolve(this.mapActions.reload)
    resolver.resolve(this.authActions.showUser, props.auth.token)

    const { id } = props.params
    if (id) {
      resolver.resolve(this.postActions.loadPostDetail, id)
    }
  }

  render () {
    const { dispatch } = this.props
    const { getState } = this.context.store
    const title = getState().post.detail.title
    const defaultTitle = this._T('title.site')
    return (
      <DocumentTitle title={title} defaultTitle={defaultTitle}>
        <PostDetail
          {...bindActionCreators(PostActions, dispatch)}
          {...bindActionCreators(MapActions, dispatch)}
          {...this.props}
          defaultLocale={this.getLocale()}
        />
      </DocumentTitle>
    )
  }
}

export default connect(state => ({
  auth: state.auth,
  post: state.post,
  map: state.map
}))(PostDetailHandler)
