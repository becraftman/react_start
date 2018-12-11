import _ from 'lodash';

function Comparable(data) {
    this.data = data;
}

function lt(data) {
    return this.valueOf() < new Comparable(data).valueOf();
}

function gt(data) {
    return this.valueOf() > new Comparable(data).valueOf();
}

function lte(data) {
    return this.valueOf() <= new Comparable(data).valueOf();
}

function gte(data) {
    return this.valueOf() >= new Comparable(data).valueOf();
}

function compareRange(start, end, option) {
    var map = {'<': 'lt', '>': 'gt', '<=': 'lte', '>=': 'gte'};
    var gtMethod = map[_.get(option, '0', '>=')], ltMethod = map[_.get(option, '1', '<=')];
    return this[gtMethod](start) && this[ltMethod](end);
}

function valueOf() {
    var getValueFunc = _.get(this.data, 'valueOf', _.wrap(this.data || 0));
    return getValueFunc.call(this.data);
}

function Range(start, end) {
    this.start = start;
    this.end = end;
}

function computeNextElement(start, createUnit) {
    return typeof createUnit === 'function' ? createUnit(start) : (start + createUnit);
}

function array(createUnit) {
    var tempArray = [this.start], start = this.start.valueOf(), index = 1, next = computeNextElement(start, createUnit);
    while (next <= this.end.valueOf()) {
        tempArray[index] = next;
        start = tempArray[index++].valueOf();
        next = computeNextElement(start, createUnit);
    }
    return tempArray;
}

function getComparableOptions(options) {
    var includeMap = {
        '<': ['>=', '<'],
        '>': ['>', '<='],
        '><': ['>', '<']
    };
    return includeMap[options] || [];
}

function include(value, options) {
    return new Comparable(value).compareRange(this.start, this.end, getComparableOptions(options));
}

function exclude(value, options) {
    return !this.include(value, options);
}

Comparable.prototype = {
    lt: lt,
    gt: gt,
    lte: lte,
    gte: gte,
    compareRange: compareRange,
    valueOf: valueOf
};

Range.prototype = {
    array: array,
    include: include,
    exclude: exclude
};

export default Range;