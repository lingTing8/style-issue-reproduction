// 当前日期
export const SECOND_MILLISECOND = 1000
export const MINUTE_MILLISECOND = 60 * SECOND_MILLISECOND
export const HOUR_MILLISECOND = MINUTE_MILLISECOND * 60
export const DAY_MILLISECOND = HOUR_MILLISECOND * 24

/**
 * 获取当前时间
 */
function getCurrentDate() {
  return new Date()
}

/**
 * 获得本周起止时间戳
 */
export function getCurrentWeek() {
  //获取当前时间
  const currentDate = getCurrentDate()
  //返回date是一周中的某一天
  const week = currentDate.getDay()
  //减去的天数
  const minusDay = week != 0 ? week - 1 : 6
  //本周 周一
  const monday = new Date(currentDate.getTime() - minusDay * DAY_MILLISECOND)
  monday.setHours(0, 0, 0, 0)
  //本周 周日
  const sunday = new Date(monday.getTime() + 6 * DAY_MILLISECOND)
  sunday.setHours(23, 59, 59, 999)
  //返回
  return [monday, sunday]
}

/**
 * 获取周一到现在到时间
 */
export function getWeekStartToCurrent() {
  return [getCurrentWeek()[0]!, getCurrentDate()]
}

/**
 * 获得本月的起止时间
 */
export function getCurrentMonth() {
  //获取当前时间
  const currentDate = getCurrentDate()
  //获得当前月份0-11
  let currentMonth = currentDate.getMonth()
  //获得当前年份4位年
  let currentYear = currentDate.getFullYear()
  //求出本月第一天
  const firstDay = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0)

  //当为12月的时候年份需要加1
  //月份需要更新为0 也就是下一年的第一个月
  if (currentMonth === 11) {
    currentYear++
    currentMonth = 0 //就为
  } else {
    //否则只是月份增加,以便求的下一月的第一天
    currentMonth++
  }

  //下月的第一天
  const nextMonthDayOne = new Date(
    currentYear,
    currentMonth,
    1,
    23,
    59,
    59,
    999,
  )
  //求出当前月的最后一天
  const lastDay = new Date(nextMonthDayOne.getTime() - DAY_MILLISECOND)
  //返回
  return [firstDay, lastDay]
}

/**
 * 获取当前月初到现在到时间
 */
export function getMonthStartToCurrent() {
  return [getCurrentMonth()[0]!, getCurrentDate()]
}

/**
 * 获取本年的起止时间
 */
export function getCurrentYear() {
  //获取当前时间
  const currentDate = getCurrentDate()
  //获得当前年份4位年
  const currentYear = currentDate.getFullYear()

  //本年第一天
  const currentYearFirstDate = new Date(currentYear, 0, 1, 0, 0, 0, 0)
  //本年最后一天
  const currentYearLastDate = new Date(currentYear, 11, 31, 23, 59, 59, 999)
  //返回
  return [currentYearFirstDate, currentYearLastDate]
}

/**
 * 获取本年开始到现在到时间
 */
export function getYearStartToCurrent() {
  return [getCurrentYear()[0]!, getCurrentDate()]
}

/**
 * 获取一周前的时间
 */
export function getAWeekAgo() {
  const currentTime = getCurrentDate()
  return new Date(currentTime.getTime() - 7 * DAY_MILLISECOND)
}

/**
 * 获取本周前到现在的时间
 */
export function getAWeekAgoToCurrent() {
  return [getAWeekAgo(), getCurrentDate()]
}

/**
 * 获取一个月前的时间
 */
export function getAMonthAgo() {
  const currentDate = getCurrentDate()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // 0-11表示1-12月
  const currentDay = currentDate.getDate()
  const currentMonthDay = new Date(currentYear, currentMonth, 0).getDate() //当前月的总天数
  //如果是1月，年数往前推一年
  if (currentMonth - 1 <= 0) {
    return new Date(`${currentYear - 1}-12-${currentDay}`)
  }
  const targetMonthDay = new Date(currentYear, currentMonth - 1, 0).getDate()
  // 如果目标一个月前的天数大于当前时间
  if (targetMonthDay >= currentDay) {
    return new Date(`${currentYear}-${currentMonth - 1}-${currentDay}`)
  }
  // 当前天日期小于当前月总天数
  if (currentDay < currentMonthDay) {
    return new Date(
      `${currentYear}-${currentMonth - 1}-${
        targetMonthDay - (currentMonthDay - currentDay)
      }`,
    )
  }

  return new Date(`${currentYear}-${currentMonth - 1}-${targetMonthDay}`)
}

/**
 * 获取一个月前到现在的时间
 */
export function getAMonthAgoToCurrent() {
  return [getAMonthAgo(), getCurrentDate()]
}

/**
 * 获取一年前的时间
 */
export function getAYearAgo() {
  const currentDate = getCurrentDate()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // 0-11表示1-12月
  const currentDay = currentDate.getDate()
  const currentMonthDay = new Date(currentYear, currentMonth, 0).getDate() //当前月的总天数
  const targetMonthDay = new Date(currentYear - 1, currentMonth, 0).getDate()
  // 如果目标一个月前的天数大于当前时间
  if (targetMonthDay >= currentDay) {
    return new Date(`${currentYear - 1}-${currentMonth}-${currentDay}`)
  }
  // 当前天日期小于当前月总天数
  if (currentDay < currentMonthDay) {
    return new Date(
      `${currentYear - 1}-${currentMonth}-${
        targetMonthDay - (currentMonthDay - currentDay)
      }`,
    )
  }

  return new Date(`${currentYear - 1}-${currentMonth}-${targetMonthDay}`)
}

/**
 * 获取一年前到现在的时间
 */
export function getAYearAgoToCurrent() {
  return [getAYearAgo(), getCurrentDate()]
}
