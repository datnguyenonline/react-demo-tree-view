import React from 'react';
import './Home.css';
import $ from 'jquery';
import * as HelperCommon from './Helpers/Common.js';

import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

const width = 64;
const menuStyleList = ['Horizontal Tree', 'Vertical Tree', 'List'];
const colorGreen = 'rgba(85, 172, 63, 0.5)';

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      viewStyle: "0",
      nodeList: [],
      rootIsOpen: 0
    }
  }

  /**
   * collapse button event, append rendering child nodes 
   */
  collapseChild(number, target, element) {
    let list = this.state.nodeList;

    // root
    if (target === 0) {
      if (this.state.rootIsOpen === 0) {
        let newList = this._generateNodes(number, target);
        newList.forEach(element => {
          list.push(element);
        });
      } else {
        list = [];
      }
      this.setState({ nodeList: list, rootIsOpen: this.state.rootIsOpen === 0 ? 1 : 0 });
    } else {
      let curObj;
      let curIdx;
      list.forEach((value, index) => {
        if (value.id === target) {
          curIdx = index;
          curObj = value;
        }
      });
      if (curObj.isOpen === 0) {
        let newList = this._generateNodes(number, target);
        newList.forEach(element => {
          list.push(element);
        });
        list[curIdx].isOpen = 1;
        this.setState({ nodeList: list }, this._drawLine(this.state.nodeList));
      } else {
        list[curIdx].isOpen = 0;
        this.removeNode(target);
      }
    }
  }

  /**
   * recursive drawing line from root
   * @param {string} target 
   */
  _drawLine(e, target) {
    if (this.state.viewStyle === "0") {
      if (target === 'root') {
        target = $('#rootNode').next().children();
      } else {
        target = $('#' + target).find('.children-wrapper').first().children();
      }
      let height = 0;
      target.each((index, value) => {
        height = (index === 0) ? 24 : height + $(target[index - 1]).height() + 12;
        let c_update;
        let path_update;
        if (index === 0) {
          c_update = [{ x: 0, y: 12 }, { x: 96, y: 12 }];
          path_update = 'M' + c_update[0].x + ',' + c_update[0].y + ' ' + c_update[1].x + ',' + c_update[1].y;
        } else {
          c_update = [{ x: 0, y: 12 }, { x: width, y: 12 }, { x: 0, y: (height - 1) }, { x: width, y: (height - 1) }];
          path_update = 'M' + c_update[0].x + ',' + c_update[0].y + ' C' + c_update[1].x + ',' + c_update[1].y + ' ' + c_update[2].x + ',' + c_update[2].y + ' ' + c_update[3].x + ',' + c_update[3].y;
        }
        let svg = '<svg class="item-line-wrapper" height="' + height + '" width="96"><path d="' + path_update + '"></path></svg>';
        if ($(value).children().first().children().first().is('svg')) {
          $(value).find('svg').first().attr('height', height);
          $(value).find('svg').first().find('path').attr('d', path_update);
        } else {
          $(value).children().first().prepend(svg);
        }
        this._drawLine(e, $(value).attr('id'));
      });
    } else if (this.state.viewStyle === "1") {
      if (target === 'root') {
        target = $('ul.tree').find('li').first().find('ul').first();
      } else {
        target = $('#' + target).find('ul').first();
      }
      let parentWidth = $(target).width();
      let height = 94;
      let total = $(target).children().length - 1;
      if (total > -1) {
        let leftWidth = 0;
        target.children().each((index, value) => {
          let width;
          let c_update;
          let path_update;
          let pos = 260/2 + parseInt(($(value).find('.item-content-container').css('margin-right')));
          let svg; 
          leftWidth += (index===0)?0:$(target.children()[index-1]).width();
          if (leftWidth + index*10 + $(value).width()/2 < parentWidth/2) {
            width = parentWidth/2 - index*10 - leftWidth - pos;
            c_update = [{ x: width, y: 0 }, { x: width, y: height/2 - 1 }, { x: 0, y: height/2 }, { x: 0, y: (height - 1) }];
            path_update = 'M' + c_update[0].x + ',' + c_update[0].y + ' C' + c_update[1].x + ',' + c_update[1].y + ' ' + c_update[2].x + ',' + c_update[2].y + ' ' + c_update[3].x + ',' + c_update[3].y;
            svg = '<svg class="item-line-wrapper" height="' + height + '" width="' + width + '" style="left:'+(pos)+'px"><path d="' + path_update + '"></path></svg>';
          } else {
            width = leftWidth + (index + 1)*10 + pos - parentWidth/2;
            c_update = [{ x: 0, y: 0 }, { x: 0, y: height/2 - 1 }, { x: width, y: height/2 }, { x: width, y: (height - 1) }];
            path_update = 'M' + c_update[0].x + ',' + c_update[0].y + ' C' + c_update[1].x + ',' + c_update[1].y + ' ' + c_update[2].x + ',' + c_update[2].y + ' ' + c_update[3].x + ',' + c_update[3].y;
            svg = '<svg class="item-line-wrapper" height="' + height + '" width="' + width + '" style="right:'+pos+'px"><path d="' + path_update + '"></path></svg>';
          }
          if ($(value).children().first().is('svg')) {
            if (leftWidth + index*10 + $(value).width()/2 < parentWidth/2) {
              $(value).find('svg').first().css('left', pos);
            } else {
              $(value).find('svg').first().css('right', pos);
              $(value).find('svg').first().css('left', 'unset');
            }
            $(value).find('svg').first().attr('width', width);
            $(value).find('svg').first().find('path').attr('d', path_update);
          } else {
            $(value).prepend(svg);
          }
          this._drawLine(e, $(value).attr('id'));
        });
      } 
    }
  }

  /**
   * generate dump node base on total number
   * @param {number} number 
   * @param {string} target 
   */
  _generateNodes(number, target) {
    let list = [];
    for (let i = 0; i < number; i++) {
      let id = HelperCommon.cMakeID(4);
      let total = HelperCommon.cRandomNumber();
      let obj = {
        id: id,
        total: total,
        parent: target,
        isOpen: 0
      };
      list.push(obj);
    }
    return list;
  }

  /**
   * resize window
   * drag to horizon scroll
   */
  _updateEnv() {
    // resize window
    $('.wrapper').width($(window).width() - 20);
    $('.wrapper').height($(window).height() - 40);

    // drag to scroll x
    // const slider = document.querySelector('.wrapper');
    // let isDown = false;
    // let startX;
    // let scrollLeft;

    // slider.addEventListener('mousedown', (e) => {
    //     isDown = true;
    //     slider.classList.add('active');
    //     startX = e.pageX - slider.offsetLeft;
    //     scrollLeft = slider.scrollLeft;
    // });
    // slider.addEventListener('mouseleave', () => {
    //     isDown = false;
    //     slider.classList.remove('active');
    // });
    // slider.addEventListener('mouseup', () => {
    //     isDown = false;
    //     slider.classList.remove('active');
    // });
    // slider.addEventListener('mousemove', (e) => {
    //     if(!isDown) return;
    //     e.preventDefault();
    //     const x = e.pageX - slider.offsetLeft;
    //     const walk = (x - startX) * 3; //scroll-fast
    //     slider.scrollLeft = scrollLeft - walk;
    // });
  }

  componentDidMount() {
    this._updateEnv();
  }

  componentDidUpdate(prevProps) {
    this._drawLine(prevProps, 'root');
  }

  /**
   * collapse in, remove all child nodes
   * @param {string} id 
   * @param {array} list 
   */
  removeNode(id) {
    let list = this.state.nodeList;
    list.forEach((value, index) => {
      if (value.parent === id) {
        let rId = value.id;
        delete list[index];
        this.removeNode(rId);
      }
    });
    list = list.filter(Boolean);
    this.setState({ nodeList: list });
  }

  /**
   * change view style
   * @param e 
   */
  handleMenuClick(e) {
    this.setState({ viewStyle: e.key })
  }

  /**
   * drag start event, set transfer data
   * @param {event} e 
   * @param {node} data 
   */
  handleOnDragStart(e, node) {
    e.persist();
    e.dataTransfer.clearData();
    e.dataTransfer.setData("text/plain", JSON.stringify(node));
  }

  /**
   * drag to node having same parent
   * @param {event} e 
   * @param {node} node 
   */
  handleOnDragOver(e, node) {
    e.preventDefault();
    if (e.currentTarget.dataset.parent === node.parent.toString()) {
      e.currentTarget.style.backgroundColor = colorGreen;
    }
  }

  /**
   * drag leave node having same parent
   * @param {event} e 
   */
  handleOnDragLeave(e) {
    e.preventDefault();
    if (e.currentTarget.style.backgroundColor !== '') {
      e.currentTarget.style.removeProperty('background-color');
    }
  }

  /**
   * drop event, swap node position
   * @param {event} e 
   * @param {node} node 
   */
  handleOnDrop(e, node) {
    e.preventDefault();
    e.persist();
    const transText = e.dataTransfer.getData("text");
    let dragEl = JSON.parse(transText);
    if (e.currentTarget.style.backgroundColor !== '')
      e.currentTarget.style.removeProperty('background-color');
    if (dragEl.parent === node.parent) {
      let list = this.state.nodeList;
      let dragIdx;
      let dropIdx;
      list.forEach((value, index) => {
        if (value.id === dragEl.id) dragIdx = index;
        if (value.id === node.id) dropIdx = index;
      });
      if (dragIdx !== dropIdx) {
        const temp = list[dragIdx];
        list[dragIdx] = list[dropIdx];
        list[dropIdx] = temp;
        this.setState({ nodeList: list });
      }

    }
  }

  /**
   * recursive rendering node list
   * @param {array} nodeList 
   * @param {string} parent 
   */
  renderNode(nodeList, root = false) {
    let nodeListHtml;
    if (root)
      nodeList = this.state.nodeList.filter((e) => e.parent === 0);
    if (nodeList !== undefined) {
      nodeListHtml = nodeList.map((node, i) => {
        let childList = this.state.nodeList.filter((e) => e.parent === node.id);
        let result;
        switch (this.state.viewStyle) {
          case "0":
            result = (
              <div className="child-wrapper" key={node.id} id={node.id}>
                <div className="child-item">
                  <div className="item-wrapper">
                    <div className="item-node">
                      <div className="item-content-container" id={"draggable_" + node.id} data-parent={node.parent}
                        draggable={true}
                        onDragStart={e => this.handleOnDragStart(e, node)}
                        onDragOver={e => this.handleOnDragOver(e, node)}
                        onDragLeave={e => this.handleOnDragLeave(e)}
                        onDrop={e => this.handleOnDrop(e, node)}>
                        <div className="item-content">
                          <h2 className="heading">{node.id}</h2>
                        </div>
                      </div>
                      <button className={"btn-group-collapse " + (node.isOpen ? 'opened' : '')} type="button" onClick={this.collapseChild.bind(this, node.total, node.id)}>{node.total}</button>
                    </div>
                    <div className="children-wrapper">{this.renderNode(childList)}</div>
                  </div>
                </div>
              </div>
            )
            break;
          case "1":
            result = (
              <li key={node.id} id={node.id}>
                <div className="item-content-container" id={"draggable_" + node.id} data-parent={node.parent}
                  draggable={true}
                  onDragStart={e => this.handleOnDragStart(e, node)}
                  onDragOver={e => this.handleOnDragOver(e, node)}
                  onDragLeave={e => this.handleOnDragLeave(e)}
                  onDrop={e => this.handleOnDrop(e, node)}>
                  <div className="item-content">
                    <h2 className="heading">{node.id}</h2>
                    <div className="photo">
                      <img src="/user_1.png" />
                      <img src="/user_2.png" />
                      <img src="/user_3.png" />
                      <span className="plus">+3</span>
                    </div>
                  </div>
                </div>
                <button className={"btn-group-collapse " + (node.isOpen ? 'opened' : '')} type="button" onClick={this.collapseChild.bind(this, node.total, node.id)}>{node.total}</button>
                <ul>{this.renderNode(childList)}</ul>
              </li>
            )
            break;
          case "2":
            result = (
              <div style={{ paddingLeft: '25px' }} key={node.id}>
                <div className="tree-list-item">{i + 1}. This is node {node.id} <Button size="small" shape="circle" type={node.isOpen === 0 ? 'primary' : 'default'} onClick={this.collapseChild.bind(this, node.total, node.id)}>{node.total}</Button></div>
                {this.renderNode(childList)}
              </div>
            )
            break;
          default:
            break;
        }
        return result;
      })
    }
    return nodeListHtml;
  }

  render() {
    //console.log(this.state.nodeList);
    let menu = (
      <Menu onClick={this.handleMenuClick.bind(this)}>
        {
          menuStyleList.map((value, index) => {
            return (
              <Menu.Item key={index}>
                {value}
              </Menu.Item>);
          })
        }
      </Menu>
    );
    return (
      <div className="wrapper">
        <p>DEMO TREE VIEW</p>
        <div>
          <Dropdown overlay={menu}>
            <Button>
              {menuStyleList[this.state.viewStyle]} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <br />
        <div className="container">
          {HelperCommon.rswitch(this.state.viewStyle, {
            '0':
              <div className="item-wrapper">
                <div className="item-node" id="rootNode">
                  <div className="item-content-container">
                    <div className="item-content">
                      <h2 className="heading">Board Of Directors</h2>
                    </div>
                  </div>
                  <button className={"btn-group-collapse " + (this.state.rootIsOpen ? 'opened' : '')} type="button" onClick={this.collapseChild.bind(this, 4, 0)}>4</button>
                </div>
                <div className="children-wrapper">
                  {this.renderNode(this.state.nodeList, true)}
                </div>
              </div>,
            '1':
              <div className="v-tree-container">
                <ul className="tree">
                  <li>
                    <div className="item-content-container">
                      <div className="item-content">
                        <h2 className="heading">Board Of Directors</h2>
                        <div className="photo">
                          <img src="/user_1.png" />
                          <img src="/user_2.png" />
                          <img src="/user_3.png" />
                          <span className="plus">+3</span>
                        </div>
                      </div>
                    </div>
                    <button className={"btn-group-collapse " + (this.state.rootIsOpen ? 'opened' : '')} type="button" onClick={this.collapseChild.bind(this, 4, 0)}>4</button>
                    <ul>{this.renderNode(this.state.nodeList, true)}</ul>
                  </li>
                </ul>
              </div>,
            '2':
              <div className="tree-list-container">
                <div className="tree-list-item">
                  Board Of Directors <Button size="small" shape="circle" type={this.state.rootIsOpen === 0 ? 'primary' : 'default'} onClick={this.collapseChild.bind(this, 4, 0)}>4</Button>
                </div>
                {this.renderNode(this.state.nodeList, true)}
              </div>,

          })}
        </div>
      </div>
    );
  }
}