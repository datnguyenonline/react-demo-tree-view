import React from 'react';
import './Home.css';
import $ from 'jquery';
import * as HelperCommon from './Helpers/Common.js';

import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

const width = 64;
const menuStyleList = ['Horizontal Tree', 'Vertical Tree', 'List'];

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
            this.setState({nodeList: list, rootIsOpen: this.state.rootIsOpen===0?1:0});
        } else {
            let curObj; 
            let curIdx;
            list.map((value, index) => {
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
                this.setState({ nodeList: list }, this._updateParent('#' + target, number - 1, 1));
            } else {
                list[curIdx].isOpen = 0;
                this.setState({ nodeList: list }, this._updateParent('#' + target, number - 1, 0, $('#' + target).height()));
                this.removeNode(target);
            }
        }
    }

    _updateParent(target, number, type, minusVal) {
        if ($(target).attr('class') === 'child-wrapper') {
            this._updateLine($(target), number, type, minusVal);
            this._updateParent($(target).parent().parent().parent().parent(), number, type, minusVal);
        }
    }
    _updateLine(target, number, type, minusVal) {
        let list = this.state.nodeList;
        if ($(target).next().is('div')){
            let nextId = $(target).next().attr('id');
            let height = 0;
            list.map((value, index) => {
                if ((value.id) === nextId) {
                    if (type === 1) 
                        height = value.height + (168+12)*number;
                    else
                        height = value.height - minusVal + 168 + 12;  
                    let c_update = [{x:0, y:12}, {x:width, y:12}, {x:0, y:(height-1)}, {x:width, y:(height-1)}];
                    let path_update = 'M' + c_update[0].x + ',' + c_update[0].y + ' C' + c_update[1].x + ',' + c_update[1].y + ' ' + c_update[2].x + ',' + c_update[2].y + ' ' + c_update[3].x + ',' + c_update[3].y;
                    list[index].height = height;
                    list[index].path = path_update;
                    this.setState({nodeList: list});
                    this._updateLine($(target).next(), number, type, minusVal);
                }
            });
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
            let j = (i - 2) >= 0? i : 0;
            let height = 24 + (174 * i) + (10 * j);
            let line = [{x:0, y:12}, {x:96, y:12}];
            let path = '';
            let c = [{x:0, y:12}, {x:width, y:12}, {x:0, y:(height-1)}, {x:width, y:(height-1)}];
            if (i === 0)
                path = 'M' + line[0].x + ',' + line[0].y + ' ' + line[1].x + ',' + line[1].y;
            else
                path = 'M' + c[0].x + ',' + c[0].y + ' C' + c[1].x + ',' + c[1].y + ' ' + c[2].x + ',' + c[2].y + ' ' + c[3].x + ',' + c[3].y;

            let id = HelperCommon.cMakeID(4);
            let total = HelperCommon.cRandomNumber();
            let obj = {
                height: height,
                line: line,
                path: path,
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
        $('.wrapper').width($( window ).width() - 20);
        $('.wrapper').height($( window ).height() - 40);

        // drag to scroll x
        const slider = document.querySelector('.wrapper');
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mousemove', (e) => {
            if(!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 3; //scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    componentDidMount() {
        this._updateEnv();
    }

    /**
     * collapse in, remove all child nodes
     * @param {string} id 
     * @param {array} list 
     */
    removeNode(id) {
        let list = this.state.nodeList;
        list.forEach((value,index) => {
            if (value.parent === id) {
                let rId = value.id;
                delete list[index];
                this.removeNode(rId);
            }
        });   
        list = list.filter(Boolean); 
        this.setState({nodeList:list});
    }

    /**
     * change view style
     * @param e 
     */
    handleMenuClick(e) {
        this.setState({viewStyle:e.key})
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
                                    <svg className={"item-line-wrapper " + ((i===0)?'item-line-strange':'')} height={node.height} width="96">
                                        <path d={node.path}></path>
                                    </svg>
                                    <div className="item-wrapper">
                                        <div className="item-node" id={"draggable_" + node.id} draggable="true">
                                            <div className="item-content-container">
                                                <div className="item-content">
                                                    Id: {node.id}<br />
                                                    Parent: {node.parent}<br />
                                                    Total: {node.total}<br />
                                                    Svg: 96:{node.height}<br />
                                                    Path: {node.path}
                                                </div>
                                            </div>
                                            <button className={"btn-group-collapse " + (node.isOpen?'opened':'')} type="button" onClick={this.collapseChild.bind(this, node.total, node.id)}>{node.total}</button>
                                        </div>
                                        <div className="children-wrapper">{this.renderNode(childList)}</div>
                                    </div>
                                </div>
                            </div>
                        )
                        break;
                    case "1":
                        break;
                    case "2":
                        result = (
                            <div style={{paddingLeft:'25px'}} key={node.id}>
                                <div className="tree-list-item">{i+1}. This is node {node.id} <Button size="small" shape="circle" type={node.isOpen === 0?'primary':'default'} onClick={this.collapseChild.bind(this, node.total, node.id)}>{node.total}</Button></div>
                                {this.renderNode(childList)}
                            </div>
                        );
                        break;
                    default:
                        break;
                }
                return result;
            })
        }
        return nodeListHtml;
    }

    rswitch (param, cases) {
        if (cases[param]) {
          return cases[param]
        } else {
          return cases.default
        }
    }

    render() {
        console.log(this.state.nodeList);
        let menu = (
            <Menu onClick={this.handleMenuClick.bind(this)}>
                {   
                    menuStyleList.map((value, index) => {
                        return (
                        <Menu.Item key={index}>
                            {value}
                        </Menu.Item> );
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
                   {this.rswitch(this.state.viewStyle,{
                       '0': <div className="item-wrapper">
                                <div className="item-node" id="draggable_root" draggable="true">
                                    <div className="item-content-container">
                                        <div className="item-content">
                                            This is root
                                        </div>
                                    </div>
                                    <button className={"btn-group-collapse " + (this.state.rootIsOpen ? 'opened' : '')} type="button" onClick={this.collapseChild.bind(this, 4, 0)}>4</button>
                                </div>
                                <div className="children-wrapper">
                                    { this.renderNode(this.state.nodeList, true) }
                                </div>
                            </div>,
                        '2':
                            <div className="tree-list-container"> 
                                <div className="tree-list-item">
                                    This is root <Button size="small" shape="circle" type={this.state.rootIsOpen === 0?'primary':'default'} onClick={this.collapseChild.bind(this, 4, 0)}>4</Button>
                                </div>
                                { this.renderNode(this.state.nodeList, true) }
                            </div>
                    })}
                </div>
            </div>
        );
    }
    
}