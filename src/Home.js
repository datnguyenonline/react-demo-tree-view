import React from 'react';
import ReactDOM from "react-dom";
import './Home.css';
import $ from 'jquery';
import 'jquery-ui';
import 'jquery-ui-dist/jquery-ui';
import * as HelperCommon from './Helpers/Common.js';

const width = 48;

export default class Home extends React.Component {  

    componentWillMount() {
        this.setState({
            nodeList: []
        })
    }

    /**
     * collapse button event, append rendering child nodes 
     */
    collapseChild(number, parent_key, element) {
        let list = this.state.nodeList;

        if (!$(element.target).hasClass('opened')) {
            for (let i = 0; i < number; i++) {
                let j = (i - 2) >= 0? i : 0;
                let height = 24 + (87 * i) + (10 * j);
                let line = [{x:0, y:12}, {x:96, y:12}];
                let path = '';
                let c = [{x:0, y:12}, {x:width, y:12}, {x:0, y:(height-1)}, {x:width, y:(height-1)}];
                if (i === 0)
                    path = 'M' + line[0].x + ',' + line[0].y + ' ' + line[1].x + ',' + line[1].y;
                else
                    path = 'M' + c[0].x + ',' + c[0].y + ' C' + c[1].x + ',' + c[1].y + ' ' + c[2].x + ',' + c[2].y + ' ' + c[3].x + ',' + c[3].y;

                let id = HelperCommon.cMakeID(4);
                let newNum = HelperCommon.cRandomNumber();
                let key = (parent_key!=0)?parent_key + '-' + String(i+1):String(i+1);
                let obj = {
                    height: height,
                    line: line,
                    path: path,
                    id: id,
                    newNum: newNum,
                    key: key,
                    parent_key: parent_key
                };
                console.log(obj);
                list.push(obj);
            }
            console.log(list);
            this.setState({
                nodeList: list
            });

            // update parent, draw lines
            //this._updateParent(element.target);
            //this._initDropNode();

            // update button status class
            $(element.target).addClass('opened');
        } else {
            if ($(element.target).parent().next().is('div')) {
                $(element.target).removeClass('opened');
                //this._updateParent(element.target);
            }
        }
    }

    /**
     * recusive updating parents of current clicked button
     */
    _updateParent(element) {
        let parent = $(element).parent().parent().parent().parent();
        if ($(parent).attr('class') === 'child-wrapper') {
            this._updateLine($(parent));
            this._updateParent($(parent));
        }
    }
    
    /**
     * calculating again svg and path for all next elements
     */
    _updateLine(element) {
        if ($(element).next().is('div')){
            let height = 0;
            let childList = $(element).parent().children();
            $.each(childList, function( index, value ) {
                if (index <= $(element).index()) {
                    height += $(value).height() + 24;
                }
            });
            $(element).next().find('svg').first().attr('height', height);
            let c_update = [{x:0, y:12}, {x:width, y:12}, {x:0, y:(height-1)}, {x:width, y:(height-1)}];
            let path_update = 'M' + c_update[0].x + ',' + c_update[0].y + ' C' + c_update[1].x + ',' + c_update[1].y + ' ' + c_update[2].x + ',' + c_update[2].y + ' ' + c_update[3].x + ',' + c_update[3].y;
            $(element).next().find('svg').find('path').first().attr('d', path_update);
            this._updateLine($(element).next());
        }
    
    }

    /**
     * init drag drop event for item-node class element
     */
    _initDropNode() {
        var self = this;
        $('.item-node').each(function(index, value) {
            let element_id = $(value).attr('id');
            let element = '#' + element_id;
            $(element).draggable({
                revert: true,
                start: function(event, ui) {
                    // remove children of source el
                    ReactDOM.unmountComponentAtNode($(element).next()[0]);
                    $(element).children('button').removeClass('opened');
                    self._updateParent($(element).children('button'));
                }
            });
            $(element).droppable({
                accept: $['id^="draggable_"'],
                drop: function(event, ui)
                {
                    // remove children of destination el
                    ReactDOM.unmountComponentAtNode($(element).next()[0]);
                    $(element).children('button').removeClass('opened');
                    self._updateParent($(element).children('button'));
        
                    // swap content and button
                    // ...not working now. need check!
                    var source = $(ui.draggable).parent().parent().parent();
                    console.log(source.parent().children());
                    $.each(source.parent().children(), function(index, value) {
                        if (element_id === $(value).children().children().children()[1].id){
                            var copy_to = $(element).html();
                            var copy_from = $(ui.draggable).html();
                            $(ui.draggable).html(copy_to);
                            $(element).html(copy_from);
                        }
                    });
                }
            });
        })
        
    }

    /**
     * resize window
     * drag to horizon scroll
     */
    _updateEnv() {
        // resize window
        $('.wrapper').width($( window ).width()/5*4);
        $('.wrapper').height($( window ).height()/5*4);

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

    renderNode(nodeList, parent) {
        console.log(parent);
        console.log(nodeList);
        
        let nodeListHtml;
        if (nodeList !== undefined) {
            nodeListHtml = nodeList.map((node, i) => {
                if (node.parent_key == parent) {
                    return (
                        <div className="child-wrapper" key={node.key}>
                            <div className="child-item">
                                <svg className={"item-line-wrapper " + ((i===0)?'item-line-strange':'')} height={node.height} width="96">
                                    <path d={node.path}></path>
                                </svg>
                                <div className="item-wrapper">
                                    <div className="item-node" id={"draggable_" + node.id} draggable="true">
                                        <div className="item-content-container">
                                            <div className="item-content">
                                                This is test {i+1}
                                                <br />
                                                Total: {node.newNum}
                                            </div>
                                        </div>
                                        <button className="btn-group-collapse" type="button" onClick={this.collapseChild.bind(this, node.newNum, node.key)}>{node.newNum} &gt;</button>
                                    </div>
                                    <div className="children-wrapper">{this.renderNode(nodeList.filter( function (newNode) {return newNode.parent_key === node.key;}), node.key)}</div>
                                </div>
                            </div>
                        </div>
                    )
                }
            })
        }
        return nodeListHtml;
    }

    render() {
        return ( 
            <div className="wrapper">
                <p>Demo tree view reactjs</p>
                <div className="container">
                    <div className="item-wrapper">
                        <div className="item-node" id="draggable_root" draggable="true">
                            <div className="item-content-container">
                                <div className="item-content">
                                    This is test
                                </div>
                            </div>
                            <button className="btn-group-collapse" type="button" onClick={this.collapseChild.bind(this, 4, 0)}>4 &gt;</button>
                        </div>
                        <div className="children-wrapper">
                            { this.renderNode(this.state.nodeList, 0) }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}