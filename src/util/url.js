import _ from 'lodash'
import Period from './period.js'
import {matchNatural} from './formatter.js'

/**
 * Inside
 * get basic location
 */
export const getWindowLocation = () => window.location;

export const queryStringToObject = (search) => {
    let searchString = search || getWindowLocation().search || '?';
    let queryDescriptions = searchString.slice(1).split('&');
    let array = _.chain(queryDescriptions).compact().map((description) => {
        let dataArray = description.split('=');
        let key=dataArray[0];
        let value=dataArray[1];
        return {key: key, value: decodeURIComponent(value)};
    }).value();
    return _.zipObject(_.map(array, 'key'), _.map(array, 'value'));
};

/**
 * 获取当前url的相对路径,不包括url的query参数(?之后的参数)
 * url的query参数可以通过this.props.location.query获取,但也之在Router范围内Route对应的Component顶层有效
 */
export const getPathname = () => getWindowLocation().pathname;

export const getLocation = (basePathname = '/' + window.appBasename) => {
    let {pathname, search} = getWindowLocation();
    return {
        pathname,
        cleanPathname: _.startsWith(pathname, basePathname) ? pathname.slice(basePathname.length) : pathname,
        search,
        query: queryStringToObject(search)
    }
};

const getObjectMapper = () => (value, key) => value ? (key + '=' + value) : undefined;

const queryToSearch = (wrapper, mapper) => _.chain(wrapper).map(mapper).compact().join('&').value();

const encodeValue = (source) => {
    let value = _.trim(source);
    return value || value === false || value === 0 ? encodeURIComponent(value) : value;
};

export const queryObjectToString = (query = {}) => {
    let encodeQuery = _.mapValues(query, encodeValue);
    let searchValue = queryToSearch(encodeQuery, getObjectMapper());
    return searchValue ? ('?' + searchValue) : undefined;
};

class UndefinedPeriodLike {

    getValue() {
        return undefined;
    }

    getTime() {
        return undefined;
    }

    format() {
        return undefined;
    }

}

const getIdentifyQueryValue = (value) => !matchNatural(value) ? undefined : Number(value);

const getBooleanQueryValue = (value) => value === 'true' ? true : (value === 'false' ? false : undefined);

const getPageQueryValue = (value) => !matchNatural(value) ? 1 : Number(value);

const getDateQueryValue = (value) => Period.couldBePeriod(value) ? new Period(value).floor('h') : new UndefinedPeriodLike();

const getDateTimeQueryValue = (value) => Period.couldBePeriod(value) ? new Period(value) : new UndefinedPeriodLike();

const getDateFormatQueryValue = (value) => Period.couldBePeriod(value) ? new Period(value).format('YYYY-MM-DD') : undefined;

const getDateTimeFormatQueryValue = (value) => Period.couldBePeriod(value) ? new Period(value).format('YYYY-MM-DD HH:mm:ss') : undefined;

const getNaturalQueryValue = (value) => !matchNatural(value) ? 0 : Number(value);

const getSizeQueryValue = (value) => {
    let found = _.find(['10', '20', '50', '100'], (val) => val === value);
    if (found) {
        return Number(found);
    } else {
        return 10;
    }
};

const getArrayQueryValue = (array, value) => {
    let arraySource = _.map(array, (data) => data ? data.toString() : data);
    return _.indexOf(arraySource, value) > -1 ? value : undefined;
};

const parseQueryValue = (type, value) => {
    let processor = {
        'identify': getIdentifyQueryValue,
        'boolean': getBooleanQueryValue,
        'page': getPageQueryValue,
        'date': getDateQueryValue,
        'dateTime': getDateTimeQueryValue,
        'dateFormat': getDateFormatQueryValue,
        'dateTimeFormat': getDateTimeFormatQueryValue,
        'natural': getNaturalQueryValue,
        'size': getSizeQueryValue
    };
    return _.isArray(type) ? getArrayQueryValue(type, value) : _.get(processor, type, _.wrap(value))(value);
};

export const pickQueryParams = (query, paramDesc, defaultQuery = {}) => {
    let queryObject = query || getLocation().query;
    let decodeObject = _.mapValues(queryObject, decodeURIComponent);
    return _.mapValues(paramDesc, (type, key) => {
        let value = _.get(decodeObject, key);
        let queryValue = parseQueryValue(type, value);
        let defaultValue = _.get(defaultQuery, key);
        return typeof _.get(queryValue, 'getTime') === 'function' && !queryValue.getTime() || (queryValue === undefined && defaultValue) ?
            _.get(defaultQuery, key, queryValue) : queryValue;
    });
};