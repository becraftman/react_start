import _ from 'lodash'
import Period from './period.js'

let formatterConfig = {};

export const config = (con) => {
    formatterConfig = con;
};

export const formatDatetime = (dateLike, pattern = formatterConfig.datetime || 'YYYY-MM-DD HH:mm', defaultData = '') => dateLike ? new Period(dateLike).format(pattern) : defaultData;

const getAutoSplitDigit = (autoSplit, data, fixed) => {
    let currencyData = Number(data).toFixed(fixed !== undefined ? fixed : 2);
    let index = currencyData.indexOf('.');
    if (autoSplit && index > -1) {
        let long = currencyData.slice(0, index);
        let digs = currencyData.slice(index);
        let array = Array.prototype.slice.apply(long);
        let value = _.chain(array).reverse().chunk(3).map((unit) => _.reverse(unit).join('')).reverse().join(',').value();
        return fixed ? (value + digs) : value;
    } else {
        return currencyData;
    }
};

export const formatDigit = (data, config = {}) => {
    let currentConfig = _.assign({}, _.get(formatterConfig, 'dig', {}), config);
    let {autoSplit = false, fixed = 0, defaultData = ''} = currentConfig;
    if (data !== null && !isNaN(data) && isFinite(data)) {
        return getAutoSplitDigit(autoSplit, data, fixed);
    } else {
        return defaultData;
    }
};

export const formatCurrency = (data, config = {}) => {
    let currentConfig = _.assign({}, _.get(formatterConfig, 'currency', {}), config);
    let {unit = '¥', autoSplit = false, defaultData = ''} = currentConfig;
    return data || data === 0 ? (unit + formatDigit(data, {defaultData, autoSplit, fixed: 2})) : defaultData;
};

export const formatPercent = (value, unit = '%') => getPercentNumber(value).toFixed(2) + unit;

export const matchNumber = (value) => {
    return !isNaN(value) && value !== '' && value !== false && value !== null;
};

export const matchNatural = (value) => {
    return matchNumber(value) && /^(-)?[0-9][0-9]*$/.test(value.toString());
};

export const getPercentNumber = (value) => {
    if (value !== null && !isNaN(value) && isFinite(value)) {
        let number = Number(value);
        return number * 100;
    } else {
        return 0;
    }
};

export const replaceNaN = (number, replacement = "-") => {
    return _.isNaN(number) ? replacement : number;
};

export const toFix = (number, num = 2) => {
    return _.isNaN(number) ? number : _.toNumber(number.toFixed(num));
};

export const formatFixedTwo=(number)=>isNaN(number)?number:number.toFixed(2);

export const formatHour = (hour, lastPad) => hour === 24 ? '23:59' : _.padStart(hour, 2, '0') + (lastPad || ':00');

// 选择今天以后的日期
export const disabledDate = (calendarDate) => {
    let theDate = new Period(calendarDate);
    return theDate.floor().lt(new Period().floor());
};