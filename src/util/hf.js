import _ from 'lodash'
import {useRouterHistory} from 'react-router'
import {createHistory} from 'history'
import {getLocation, queryObjectToString, queryStringToObject} from './url.js'

let history;

let staticQueryIdentifies = [];

let basePathname = window.appBasename;

export const createBaseHistory = (basename, identifies) => {
    basePathname = basename || basePathname;
    staticQueryIdentifies = identifies;
    history = useRouterHistory(createHistory)({basename: '/' + basePathname});
    return history;
};

export const setStaticQueryIdentifies = (identifies) => staticQueryIdentifies = identifies;

export const addStaticQueryIdentifies = (identifies) => staticQueryIdentifies = staticQueryIdentifies.concat(identifies);

export const removeStaticQueryIdentifies = (identifies) => {
    let map = _.isArray(identifies) ? _.zipObject(identifies, identifies) : typeof identifies === 'string' ? {[identifies]: identifies} : identifies;
    staticQueryIdentifies = _.reject(staticQueryIdentifies, (identify) => _.get(map, identify));
};

export const getHistory = (listen) => {
    if (typeof listen === 'function') {
        history.listen(listen);
    }
    return history;
};

const getStringValueQuery = (query) => _.chain(query).omitBy(_.isUndefined).mapValues((value) => decodeURIComponent(value.toString())).value();

const getCurrentStaticQuery = () => {
    let location = getLocation(basePathname);
    return _.pick(queryStringToObject(location.search), staticQueryIdentifies);
};

const getCurrentQuery=()=>{
    let {search} = getLocation();
    return queryStringToObject(search);
};

export const push = (pathname, query) => {
    let search = queryObjectToString(_.assign({}, getCurrentStaticQuery(), query || {}));
    return getHistory().push({pathname, search});
};

export const pushAssign = (pathname, query) => {
    let search = queryObjectToString(_.assign({}, getCurrentQuery(), query || {}));
    return getHistory().push({pathname, search});
};

export const replace = (pathname, query) => {
    let search = queryObjectToString(_.assign({}, getCurrentStaticQuery(), query || {}));
    return getHistory().replace({pathname, search});
};

export const searchReplace = (query) => {
    search(query, true);
};

export const searchAssignReplace = (query) => {
    searchAssign(query, true);
};

export const search = (query, replace) => {
    let {cleanPathname, search} = getLocation();
    let current = queryStringToObject(search);
    let newSearch = queryObjectToString(_.assign({}, _.pick(current, staticQueryIdentifies), query || {}));
    if (!replace && !_.isEqual(current, getStringValueQuery(query))) {
        getHistory().push({pathname: cleanPathname, search: newSearch});
    } else {
        getHistory().replace({pathname: cleanPathname, search: newSearch});
    }
};

export const searchAssign = (query, replace) => {
    let currentQuery = queryStringToObject();
    search(_.assign({}, currentQuery, query), replace);
};

export const goBack = () => getHistory().goBack();

export default {
    createBaseHistory,
    getHistory,
    push,
    replace,
    goBack,
    search,
    searchReplace,
    searchAssign,
    searchAssignReplace
}