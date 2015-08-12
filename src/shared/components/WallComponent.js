import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { isEmpty } from 'lodash'
import Cards from 'shared/components/wall/PostCards'
import Ad from 'shared/components/addon/ad'

export default class Wall extends React.Component {

  constructor (props) {
    super(props)
  }

  static propTypes = {
    post: PropTypes.object.isRequired,
    loadFunc: PropTypes.func.isRequired
  }

  render () {
    const Translate = require('react-translate-component')
    const { post, loadFunc } = this.props
    const loading = post.loading || false

    return (
      <main className="ui stackable full page grid">
        <div className="column">
          <div className="row switch-btns">
            <div className="ui orange inverted buttons">
              <Link className="ui button" to='/wall/today'>
                <Translate content="header.wall" />
              </Link>
              <Link className="ui button" to='/wall/cal'>
                <Translate content="header.cal" />
              </Link>
            </div>
          </div>
          <div className="row">
            <Cards
              posts={post.posts}
              loadFunc={loadFunc}
              hasMore={post.hasMore}
              diff={126}
            />
            {loading && (
              <div className="ui segment basic has-header">
                <div className="ui active inverted dimmer">
                  <div className="ui large text loader">
                    <Translate content="wall.loading" />
                  </div>
                </div>
              </div>
            )}
            {!loading && isEmpty(post.posts) && (
              <div className="ui segment basic center aligned">
                <Translate content="post.nodata" />
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }
}
