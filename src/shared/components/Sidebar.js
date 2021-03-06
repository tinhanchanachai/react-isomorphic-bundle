import React, { Component, PropTypes } from 'react'
import { detectIE } from 'shared/utils/browser-utils'

let Menu
if (process.env.BROWSER) {
  if (!detectIE()) {
    Menu = require('react-burger-menu').bubble
  } else {
    Menu = require('react-burger-menu').stack
  }
} else {
  Menu = require('react-burger-menu').stack
}

export default class Sidebar extends Component {

  static propTypes = {
    children: PropTypes.any
  }

  static contextTypes = {
    history: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
  }

  render () {
    return (
      <Menu
        width={ 230 }
        pageWrapId={'page-wrap'}
        outerContainerId={'outer-container'}>
        <div>
          { this.props.children }
        </div>
      </Menu>
    )
  }
}
