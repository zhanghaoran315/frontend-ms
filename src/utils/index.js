import request from './request'
export * from './cache'
export { request }

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export function formatDate(utcString, fmt = DEFAULT_FORMAT) {
  return dayjs.utc(utcString).utcOffset(8).format(fmt)
}
