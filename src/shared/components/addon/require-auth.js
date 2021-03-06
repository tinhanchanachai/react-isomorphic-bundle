import { checkToken, showUser, logout } from 'shared/actions/AuthActions'

export default function (nextState, replaceState) {
  const nextPathname = nextState.location.pathname
  const { dispatch, getState } = this.store
  if (process.env.BROWSER) dispatch(checkToken())
  const isAuthenticated = getState().auth.isAuthenticated
  const verified = getState().auth.verified

  dispatch(showUser(getState().auth.token))

  if (!isAuthenticated) {
    replaceState({ nextPathname: nextPathname }, '/login')
  }

  if (process.env.BROWSER && !verified) {
    this.store.dispatch(logout())
    replaceState({ nextPathname: nextPathname }, '/login')
  }
}
