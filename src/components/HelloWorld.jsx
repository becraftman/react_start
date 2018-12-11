import React, {Component} from 'react';
import {Button, ButtonLink} from "../ui/Button";

export class HelloWorld extends  Component {

  constructor(props) {
    super(props);
  }

  static tipForBtnLink(e) {
    console.log(e)
  }

  render() {
    return (<div>
      <div>Hello World!</div>
      <div><Button className={"btn"}  cutout={false}>这是一个按钮</Button></div>
      <div><ButtonLink className={"btnLink"} url={"www.baidu.com"} onClick={(e) => this.tipForBtnLink(e)}>这是一个链接 </ButtonLink></div>
    </div>);

  }
}