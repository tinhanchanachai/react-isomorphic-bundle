import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { save } from '../actions/AuthActions'
import DocumentTitle from './addon/document-title'

export default class SyncTokenHandler extends React.Component {

  constructor (props) {
    super(props)
    this.state = { isClient: false }
  }

  static propTypes = {
    location: PropTypes.object.isRequired
  }

  static contextTypes = {
    store: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  }

  componentDidMount () {
    this.setState({ isClient: true })

    const dispatch = this.context.store.dispatch
    const token = this.props.location.query.token

    new Promise((resolve) => {
      dispatch(save(token))
      setTimeout(() => {
        resolve('ok')
      }, 1000)

    }).then(() => this.context.router.transitionTo('/home'))
  }

  render () {
    const Translate = require('react-translate-component')
    const _t = require('counterpart')

    const msg = this.state.isClient
      ? <Translate content="redirect.msg" />
      : <div><a href="/"><Translate content="redirect.click" /></a></div>

    return (
      <DocumentTitle title={_t('title.redirect')}>
        <main className="ui stackable page grid">
          <div className="column">
            { msg }
          </div>
        </main>
      </DocumentTitle>
    )
  }
}
