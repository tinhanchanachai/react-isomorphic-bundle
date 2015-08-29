import React, { PropTypes } from 'react'
import { BaseComponent } from 'shared/components'
import { Link } from 'react-router'
import { isEmpty } from 'lodash'

export default class HomeComponent extends BaseComponent {

  static propTypes = {
    auth: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
  }

  renderNews (posts) {
    if (!isEmpty(posts)) {
      const self = this
      return posts.map(function (post) {
        return self.renderItem(post)
      })
    } else {
      return <div></div>
    }
  }

  renderItem (post) {
    return (
    <div key={post.id} className="ui orange icon message">
      <i className="inbox icon"></i>
      <div className="content">
        <h2><Link to={`/wall/posts/${post.id}`}>{post.ocname}</Link></h2>
        <div className="header">
          {post.title}
        </div>
      </div>
    </div>
    )
  }

  render () {
    const Translate = require('react-translate-component')
    const TranslateProps = React.createFactory(Translate)
    const tokenProps = {
      component: 'input',
      type: 'text',
      name: 'token',
      scope: 'home_token',
      readOnly: true,
      attributes: {
        placeholder: 'placeholder'
      },
      value: this.props.auth.token
    }

    const { user } = this.props.auth
    const { posts } = this.props.post
    const loading = this.props.post.isFetching

    return (
      <main className="ui column centered stackable page grid">
        <div className="column">
          <h1 className="title">最新公告</h1>
          { ::this.renderNews(posts) }
          {loading && isEmpty(posts) && (
            <div className="ui segment basic has-header">
              <div className="ui active inverted dimmer">
                <div className="ui indeterminate text loader">
                  <Translate content="wall.loading" />
                </div>
              </div>
            </div>
          )}
          {!loading && isEmpty(posts) && (
            <div>
              <div className="ui hidden divider"></div>
              <div className="ui segment basic has-header center aligned">
                <Translate content="post.nodata" />
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }
}
