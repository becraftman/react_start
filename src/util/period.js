import _ from 'lodash';
import Range from './range.js';


var simpleFormat = ['y', 'M', 'd', 'h', 'm', 's', 'ms'],
    normalFormat = ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'],
    formatSupports = ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds', 'Milliseconds'],
    normalMethods = _.zipObject(normalFormat, formatSupports),
    methods = _.zipObject(simpleFormat, formatSupports),
    defaultDurationUnits=['ms', 's', 'm', 'h', 'd'],
    formatPatterns = {
        year: 'YYYY',
        month: 'YYYY-MM',
        date: 'YYYY-MM-DD',
        hour: 'YYYY-MM-DD HH',
        minute: 'YYYY-MM-DD HH:mm',
        second: 'YYYY-MM-DD HH:mm:ss'
    };

function getMinValue() {
    return [1970, 0, 1, 0, 0, 0, 0];
}

function getMaxValue() {
    return [-1, 11, 0, 23, 59, 59, 999];
}

function wrapDateFunction(key) {
    return _.startsWith(key, 'set') ? wrapDateSetFunction.call(this, key) : wrapDateNoSetFunction.call(this, key);
}

function addMethod(methodName) {
    this[methodName] = wrapDateFunction.call(this, methodName);
}

function getBasicPrototype() {
    var self = this;
    _.each(formatSupports.concat(['Time']), function (basicMethod) {
        addMethod.call(self, 'set' + basicMethod);
        addMethod.call(self, 'get' + basicMethod);
    });
}

function setMonth() {
    return this.setMonth(Number(arguments[0]) - 1);
}

function getMonth() {
    return this.getMonth() + 1;
}

function wrapDateSetFunction(key) {
    var self = this, date = this.date;
    var func = key === 'setMonth' ? setMonth : date[key];
    return function () {
        func.apply(date, Array.prototype.slice.apply(arguments));
        return self;
    }
}

function wrapDateNoSetFunction(key) {
    var self = this, date = this.date;
    var func = key === 'getMonth' ? getMonth : date[key];
    return function () {
        return func.apply(date, Array.prototype.slice.apply(arguments));
    }
}

function getDate(args) {
    return !args.length ? new Date() : getDateByArgs(args);
}

function parseNaNDateArguments(arg) {
    return typeof arg === 'string' ? arg.replace(/-/g, '/') : arg;
}

function getDateByArgs(args) {
    var argStart = args[0];
    return args.length === 1 ? (argStart || argStart === 0 ? new Date(!isNaN(argStart) ? Number(argStart) : parseNaNDateArguments(argStart)) : new Date()) :
        getDateByMultiArgs(args);
}

function getDateByMultiArgs(args) {
    var date = new Date();
    _.each(args, function (arg, index) {
        var key = simpleFormat[index], method = 'set' + methods[key];
        date[method](arg);
    });
    return date;
}

function Period() {
    var argArray = Array.prototype.slice.apply(arguments);
    if (typeof _.get(argArray, [0, 'isPeriod']) === 'function' && argArray[0].isPeriod()) {
        _.assign(this, _.pick(argArray[0], ['strate', 'from']));
        this.date = argArray[0].date;
    } else {
        this.date = getDate(argArray);
    }
    getBasicPrototype.call(this);
}

function flatten(strate, from) {
    var start = _.indexOf(simpleFormat, from || 'h');
    var array = strate == 'ceil' ? getMaxValue() : getMinValue();
    this.strate = strate;
    this.from = from;
    setValuesByFormat.call(this, start, array);
    return this;
}

function ceil(from) {
    return this.flatten('ceil', from);
}

function floor(from) {
    return this.flatten('floor', from);
}

function setValuesByFormat(start, array) {
    var self = this, month;
    _.chain(array).slice(start).each(function (value, index) {
        var key = simpleFormat[start + index], method = methods[key];
        var data = value;
        if (method === 'Date' && data === 0) {
            month = self.date.getMonth();
            self.date.setDate(1);
            self.date.setMonth(month + 1);
        }
        data >= 0 && self.date['set' + method](data);
    }).value();
}

function getValue() {
    return this.date;
}

function subTime(from, to) {
    var start = from || 'y';
    var end = to;
    var floor = this.copy().floor(start).getTime();
    var ceil = end ? this.copy().floor(end).getTime() : this.getTime();
    return ceil - floor;
}

function getMaxDateInMonth(period) {
    var prepared = period || this;
    var time = (!isPeriod(prepared) && prepared.valueOf() < 13 ? new Period().setMonth(prepared) : new Period(prepared)).getTime();
    var date = new Date(time);
    var month = date.getMonth();
    date.setDate(1);
    date.setMonth(month + 1);
    date.setDate(0);
    return date.getDate();
}

function add(value, key) {
    var method = methods[key || 'ms'] || normalMethods[key];
    var dataValue = this.date['get' + method]() + Number(value || 0);
    this.date['set' + method](dataValue);
    return this;
}

function copy() {
    var period = new Period(this.date.getTime());
    period.strate = this.strate;
    period.from = this.from;
    return period;
}

function clean() {
    this.strate = undefined;
    this.from = undefined;
    return this;
}

function cleanCopy() {
    return new Period(this.date.getTime());
}

function bt(start, end, options) {
    return new Range(new Period(start), new Period(end)).include(this, options);
}

function range(to, unit) {
    var last = unit ? this.cleanCopy().add(to, unit) : new Period(to);
    return new Range(this, last);
}

function createFlattenPeriod(period, strate, from) {
    var newPeriod = new Period(period);
    var currentStrate = strate || this.strate;
    var currentFrom = from || this.from;
    return this.isPeriod(period) || !currentStrate ? newPeriod : newPeriod.flatten(currentStrate, currentFrom);
}

function lt(period, strate, from) {
    return this.valueOf() < createFlattenPeriod.call(this, period, strate, from).valueOf();
}

function gt(period, strate, from) {
    return this.valueOf() > createFlattenPeriod.call(this, period, strate, from).valueOf();
}

function lte(period, strate, from) {
    return this.valueOf() <= createFlattenPeriod.call(this, period, strate, from).valueOf();
}

function gte(period, strate, from) {
    return this.valueOf() >= createFlattenPeriod.call(this, period, strate, from).valueOf();
}

function eq(period, strate, from) {
    return this.valueOf() == createFlattenPeriod.call(this, period, strate, from).valueOf();
}

function getDay() {
    var day = this.date.getDay();
    return day || 7;
}

function copyPart(period, other, text) {
    var getMethod = 'get' + text;
    var setMethod = 'set' + text;
    var data = other[getMethod]();
    period[setMethod](data);
}

function take(period, from, to) {
    var fromIndex = _.indexOf(simpleFormat, from);
    var toIndex = _.indexOf(simpleFormat, to);
    var other = new Period(period);
    if (fromIndex < 0 && toIndex > -1) {
        _.chain(formatSupports).slice(0, toIndex + 1).each(_.partial(copyPart, this, other)).value();
        return this;
    } else if (toIndex < 0 && fromIndex > -1) {
        _.chain(formatSupports).slice(fromIndex).each(_.partial(copyPart, this, other)).value();
        return this;
    } else if (fromIndex >= toIndex) {
        return other;
    } else {
        _.chain(formatSupports).slice(fromIndex, toIndex + 1).each(_.partial(copyPart, this, other)).value();
        return this;
    }
}

function setDataByUnit(value, unit) {
    var methodStart = _.get(methods, unit || 's');
    this['set' + methodStart](value);
}

function setData(value, unit) {
    var methodStart = _.get(methods, unit || 's');
    if (!value) {
        return this;
    } else if (!isNaN(value)) {
        this['set' + methodStart](Number(value));
    } else if (typeof value === 'string' || _.isArray(value)) {
        this.date = new Date(value);
    } else {
        _.each(value, _.bind(setDataByUnit, this));
    }
    return this;
}

function formatTimeUnit(value, unit, maxLength, pattern) {
    var valueString = value.toString();
    var reg = new RegExp(unit + '{' + maxLength / 2 + ',' + maxLength + '}', 'g');
    return (pattern || '').replace(reg, function (w) {
        return maxLength > 2 ? _.padStart(valueString, maxLength, '0').slice(maxLength - w.length) : _.padStart(valueString, w.length, '0');
    });
}

function format(string) {
    var year = this.getFullYear();
    var month = this.getMonth();
    var date = this.getDate();
    var hour = this.getHours();
    var min = this.getMinutes();
    var sec = this.getSeconds();
    var pattern = _.get(formatPatterns, string, string) || 'YYYY-MM-DD HH:mm:ss';
    return formatTimeUnit(hour > 12 ? (hour - 12) : hour, 'h', 2, formatTimeUnit(sec, 's', 2, formatTimeUnit(min, 'm', 2, formatTimeUnit(hour, 'H', 2, formatTimeUnit(date, 'D', 2, formatTimeUnit(month, 'M', 2, formatTimeUnit(year, 'Y', 4, pattern)))))));
}

function duration(to, unit) {
    var range = this.range(to);
    var rangeArray = range.array(averageAs(unit));
    var size = _.size(rangeArray);
    return _.last(rangeArray).valueOf() === new Period(to).valueOf() ? (size - 1) : size;
}

function like(period) {
    let likePeriod = createFlattenPeriod.call(this, period.getValue());
    return this.valueOf() === likePeriod.valueOf();
}

function valueOf() {
    return this.getValue().getTime() || 0;
}

function isPeriod(period) {
    let current = period || this;
    if (_.get(period, 'date')) {
        return typeof current.isPeriod === 'function'
            && typeof current.flatten === 'function'
            && typeof current.clean === 'function'
            && typeof current.copy === 'function'
            && typeof current.add === 'function'
            && typeof current.valueOf === 'function';
    }
}

function toString() {
    return this.date.toUTCString();
}

function getData(key) {
    var method = methods[key || 'ms'] || normalMethods[key];
    return this.date['get' + method]();
}

function keyFrom(unit) {
    var self = this;
    var unitData = unit || 'ms';
    var index = _.indexOf(simpleFormat, unitData);
    var format = simpleFormat.slice(0, index + 1);
    return _.map(format, function (u) {
        return self.get(u);
    }).join('_');
}

function isDateFormat(string) {
    return /^(\d{4})\-(\d{2})\-(\d{2})$/.test(string) || /^(\d{4})\／(\d{2})\／(\d{2})$/.test(string);
}

function isDateTimeFormat(string) {
    return /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(string) || /^(\d{4})\／(\d{2})\／(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.test(string);
}

function isPeriodFormat(string) {
    return isDateTimeFormat(string) || isDateFormat(string);
}

function matchNumber(value) {
    return !isNaN(value) && value !== '' && value !== false && value !== null;
}

function couldBePeriod(periodLike) {
    var isPeriodObject = isPeriod.call(periodLike);
    var isNumberLike = matchNumber(periodLike) || (periodLike || periodLike === 0) && matchNumber(periodLike.valueOf());
    var isDateFormatter = typeof periodLike === 'string' ? isPeriodFormat(periodLike) : false;
    return isPeriodObject || isNumberLike || isDateFormatter;
}

function averageAs(unit) {
    return function (last) {
        return new Period(last).copy().add(1, unit);
    };
}

function now() {
    return new Period();
}

function getUnitIntervals() {
    var intervals = [1, 1000, 60, 60, 24];
    var last = 1;
    return _.map(intervals, function (interval) {
        var data = last * interval;
        last = data;
        return data;
    });
}

function getUnitInterval(unit){
    var unitIndex=_.indexOf(defaultDurationUnits,unit);
    return _.get(getUnitIntervals(), unitIndex);
}

function durationAs(milliSeconds, from,defineUnits) {
    var result = {};
    var fromKey = from || 'd';
    var units = defineUnits||defaultDurationUnits;
    var fromUnitIndex = _.indexOf(units, fromKey);
    var fromUnitValue = getUnitInterval(fromKey);
    var fromInterval = _.floor(milliSeconds / fromUnitValue);
    var leftMilliSeconds = milliSeconds % fromUnitValue;
    if (fromUnitIndex > 0) {
        result = durationAs(leftMilliSeconds, _.get(units, fromUnitIndex - 1),defineUnits);
        return _.chain({}).set(fromKey, fromInterval).assign(result).value();
    } else {
        return _.set({}, fromKey, fromInterval);
    }
}

Period.prototype = {
    flatten: flatten,
    floor: floor,
    ceil: ceil,
    add: add,
    copy: copy,
    clean: clean,
    cleanCopy: cleanCopy,
    addYears: _.partial(add, _, 'y'),
    addMonths: _.partial(add, _, 'M'),
    addDates: _.partial(add, _, 'd'),
    addHours: _.partial(add, _, 'h'),
    addMinutes: _.partial(add, _, 'm'),
    addSeconds: _.partial(add, _, 's'),
    addMilliseconds: _.partial(add, _, 'ms'),
    take: take,
    keyFrom: keyFrom,
    'set': setData,
    'get': getData,
    //
    getValue: getValue,
    valueOf: valueOf,
    subTime: subTime,
    getMaxDateInMonth: getMaxDateInMonth,
    getDay: getDay,
    bt: bt,
    lt: lt,
    gt: gt,
    lte: lte,
    gte: gte,
    eq: eq,
    like: like,
    isPeriod: isPeriod,
    format: format,
    range: range,
    duration: duration,
    toString: toString
};

Period.couldBePeriod = couldBePeriod;

Period.matchNumber = matchNumber;

Period.averageAs = averageAs;

Period.now = now;

Period.durationAs = durationAs;

Period.getUnitInterval=getUnitInterval;

export default Period;