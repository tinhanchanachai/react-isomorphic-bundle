import React, { PropTypes } from 'react'
import Disabled from './DisabledComponent'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as AdminActions from 'client/admin/actions/AdminActions'
import * as AuthActions from 'client/admin/actions/AuthActions'
import { isEmpty, contains } from 'lodash'

class DisabledHandler extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    collect: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired
  }

  constructor (props, context) {
    super(props)
    const { dispatch } = props
    dispatch(AdminActions.fetchList({ offset: 0, limit: 8, status: 1 }))

    this.state = { page: { selected: 0 } }
  }

  handlePageClick (page) {
    const { dispatch, collect } = this.props
    const c = page.selected * collect.limit
    this.setState({ page: page })

    return dispatch(AdminActions.fetchList({
      offset: c,
      limit: collect.limit,
      status: 1,
      keyword: collect.keyword
    }))
  }

  asyncDeportAction (arr) {
    return dispatch => {
      const list = []
      if (!isEmpty(arr)) {
        arr.forEach(id => list.push(dispatch(AdminActions.deport(id))))
      }
      return Promise.all(list)
    }
  }

  deleteAdmins (checked) {
    const { dispatch } = this.props
    const self = this
    const token = AuthActions.getToken()
    return dispatch(AuthActions.showUser(token)).then(() => {
      const { user } = this.props.auth
      if (contains(checked, user.id)) {
        swal('Oops...', '不應該刪除自己。', 'error')
        return Promise.reject('Oops')
      } else {
        if (!isEmpty(checked)) {
          return new Promise((resolve, reject) => {
            swal({
              title: '您確定嗎？',
              text: '這會永久刪除使用者',
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#DD6B55',
              confirmButtonText: '確定刪除',
              cancelButtonText: '取消',
              closeOnConfirm: false,
              showLoaderOnConfirm: true
            }, function() {
              return dispatch(self.asyncDeportAction(checked)).then(() => {
                swal('刪除', '刪除作業完成', 'success')
                resolve(self.handlePageClick(self.state.page))
              }).catch((err) => {
                swal('Oops...', err, 'error')
                reject(err)
              })
            })
          })
        } else {
          return Promise.resolve()
        }
      }
    })
  }

  blockAdmins (checked) {
    const { dispatch } = this.props
    const form = {
      blocked: checked,
      type: 'unblocked'
    }

    return dispatch(AdminActions.blockAdmins(form)).then(() => {
      return this.handlePageClick(this.state.page)
    })
  }

  render () {
    const { dispatch } = this.props
    return (
      <Disabled
        {...bindActionCreators(AdminActions, dispatch)}
        handlePageClick={::this.handlePageClick}
        action={::this.blockAdmins}
        deleteAction={::this.deleteAdmins}
        menuIndex={3}
        {...this.props}
      />
    )
  }
}

export default connect(state => ({
  auth: state.auth,
  collect: state.admin
}))(DisabledHandler)
