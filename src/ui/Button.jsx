import React, {Component} from 'react';
import {push} from '../util/hf.js';
import classNames from 'classnames';
import css from './Button.style.css';
import _ from 'lodash';

/**
 * 通用按钮
 * type: 决定颜色， primary / secondary， 默认是 primary
 * cutout: 是否镂空
 * capsule: 是否胶囊形状
 */
export const Button = (props) => {
    let {className, value, type = 'primary', size = 'default'} = props || {};
    let validProps = _.omit(props, ['className', 'inline', 'width']);
    let cutout = _.has(props, 'cutout') && _.get(props, 'cutout', true);
    let capsule = _.has(props, 'capsule') && _.get(props, 'capsule', true);
    let disabled = _.has(props, 'disabled') && _.get(props, 'disabled', true);
    let btnCss = size === 'small' ? css.btnSmall : css.btn;
    if (disabled) {
        return <span
            className={classNames(btnCss, capsule ? css.disabledCaps : css.disabled, className)} {..._.omit(validProps, ['onClick'])}>{value || props.children}</span>;
    } else if (cutout) {
        return <span
            className={classNames(btnCss, css.cutout, type === 'primary' ? css.cutoutPrimary : css.cutoutSecondary, capsule ? css.capsule : '', className)} {...validProps}>{value || props.children}</span>;
    } else {
        return <span
            className={classNames(btnCss, type === 'primary' ? '' : css.secondary, capsule ? css.capsule : '', className)} {...validProps}>{value || props.children}</span>;
    }
};

export class ButtonLink extends Component {

    onClick(e) {
        let {url, disabled, query, onClick} = this.props;
        if (disabled) {
            return;
        }
        if (onClick) {
            onClick(e);
        } else if (url) {
            push(url, query);
        }
    }

    render() {
        let {value, className, disabled, children} = this.props;
        let props = _.omit(this.props, ['value', 'className', 'disabled', 'children']);
        return (
            <a className={classNames(css.btnLink, className, disabled ? css.btnLinkDisabled : '')} {...props} href="javascript:void(0)"
               onClick={(e) => this.onClick(e)}>{value || children}</a>
        );
    }

}