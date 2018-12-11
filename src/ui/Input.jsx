import React, {Component} from 'react';
import {InputItem, TextareaItem} from 'antd-mobile';
import _ from 'lodash';

export class Input extends Component {

    render() {
        let {children} = this.props;
        let props = _.omit(this.props, ['children', 'ref']);
        return (
            <InputItem {...props} ref="input">{children}</InputItem>
        );
    }

}

export class DigitInput extends Component {

    render() {
        let {children} = this.props;
        let props = _.omit(this.props, ['children', 'type']);
        return (
            <InputItem type="digit" {...props}>{children}</InputItem>
        );
    }
}

export class Text extends Component {
    render() {
        return <TextareaItem {...this.props}/>;
    }
}