import {
  LIST_ADMIN_RELOADED,
  LIST_ADMIN_STARTED,
  LIST_ADMIN_COMPLETED,
  LIST_ADMIN_FAILED,
  BLOCK_ADMIN_STARTED,
  BLOCK_ADMIN_COMPLETED,
  BLOCK_ADMIN_FAILED
} from 'client/admin/constants/ActionTypes'
import { createReducer } from 'shared/utils/redux-utils'
import moment from 'moment'
import { merge } from 'lodash'

const initialState = {
  isFetching: false,
  errors: {},
  items: [],
  offset: 0,
  limit: 0,
  hasMore: true,
  count: null,
  blockedCount: null,
  totalPages: null,
  currPage: null,
  done: true,
  keyword: null
}

export default createReducer(initialState, {
  [LIST_ADMIN_RELOADED]: () => ({
    isFetching: false,
    errors: {},
    items: [],
    offset: 0,
    limit: 0,
    hasMore: true,
    count: null,
    blockedCount: null,
    totalPages: null,
    currPage: null,
    keyword: null
  }),
  [LIST_ADMIN_STARTED]: () => ({
    isFetching: true
  }),
  [LIST_ADMIN_COMPLETED]: (state, action) => {
    let hasMore = false
    if (action.items.length === action.limit) {
      hasMore = true
    }
    const items = action.items
    const o = {
      errors: {},
      items: items,
      offset: state.offset + action.limit,
      limit: action.limit,
      hasMore: hasMore,
      isFetching: false,
      totalPages: Math.ceil(+action.count / +action.limit),
      currPage: Math.ceil(+(state.offset + action.limit) / +action.limit),
      done: true,
      keyword: action.keyword
    }
    if (action.status === 0) {
      return merge(o, { count: action.count, blockedCount: null })
    } else {
      return merge(o, { blockedCount: action.count })
    }
  },
  [LIST_ADMIN_FAILED]: (state, action) =>
    ({ done: true, isFetching: false, errors: action.errors }),
  [BLOCK_ADMIN_STARTED]: () =>
    ({ done: false }),
  [BLOCK_ADMIN_COMPLETED]: (state, action) =>
    ({ done: false }),
  [BLOCK_ADMIN_FAILED]: (state, action) =>
    ({ done: false, errors: action.errors })
})
