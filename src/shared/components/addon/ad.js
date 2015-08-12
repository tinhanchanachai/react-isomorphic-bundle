/* eslint-disable max-len */
// ref: https://gist.github.com/Ambroos/734933c4d3d11c3af847
import React, { PropTypes } from 'react'

export default class Ad extends React.Component {

  constructor (props) {
    super(props)
    this._releaseTimeout = undefined
    this.state = { released: false }
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
  }

  loadAd () {
    if (process.env.BROWSER) {
      require('postscribe/htmlParser/htmlParser.js')
      const postscribe = require('exports?postscribe!postscribe')

      new Promise((resolve) => {
        setTimeout(() => {
          postscribe('#hotrank-container-' + this.props.id,
            `<script src='${this.props.link}'></script>`,
            { done: () => { resolve(true) } })
        }, 0)
      }).then(() => this.setState({ released: true }))
    }
  }

  componentDidMount () {
    this._releaseTimeout = setTimeout(() => this.loadAd(), 0)
  }

  componentWillUnmount () {
    if (this.op)
      clearTimeout(this._releaseTimeout)
  }

  render () {
    return (
      <div id={`hotrank-container-${this.props.id}`}></div>
    )
  }
}
