import { Injectable } from '@angular/core';

//节点
class LinkListNode {
  public prev = null;
  public next = null;
  public data = null;

  getValue() {
    return this.data;
  }
  setValue(data) {
    this.data = data;
  }
  getNext() {
    return this.next;
  }
  setNext(node) {
    this.next = node;
  }
  getPrev() {
    return this.prev;
  }
  setPrev(node) {
    this.prev = node;
  }
}
@Injectable()
export class SetSummaryTimeStructureService {


  //链表
  private DuLinkList = function() {

    this.head = null;
    this.current = null;
    this.tail = null;
    this.length = 0;

    //尾插法
    this.appendNode = function(node) {
      if ( this === null ) { return ; }
      if ( node === null ) { return ; }
      const tail = this.tail;
      if ( tail === null ) {
        this.tail = this.head = node;
      } else {
        tail.next = node;
        node.prev = tail;
        this.tail = node;
      }
      this.length++;
    };
    this.insertNode = function( currentNode ,  newNode) {
      if ( currentNode === this.tail ) {//判断是否将要从队列的末尾插数据
        this.appendNode(newNode);
      } else {
        newNode.prev = currentNode;
        newNode.next = currentNode.next;
        currentNode.next.prev = newNode;
        currentNode.next = newNode;
        this.length++;
      }
    };

    //移除
    this.removeNode = function(node) {
      if (this === null) { return; }
      if (node === null ) { return; }

      const prev = node.prev;

      if ( prev != null) {
        prev.next = node.next;
      }
      if ( prev === null && node.next != null) {
        node.next.prev = null;
      }
      if ( prev != null && node.next != null) {
        node.next.prev = node.prev;
      }
      if ( node === this.head ) {
        this.head = node.next;
      }
      if ( node === this.tail ) {
        if ( prev != null ) {
          this.tail = prev  ;
        } else {
          this.head = this.tail = null;
        }
      }
      node.prev = null ;
      node.next = null ;
      this.length--;
    };

    //往链表中添加数据
    this.appendData = function(data) {
      const  node = this.constructorNode(data);
      this.appendNode(node);
    };
    //往链表中插入数据
    this.insertData = function(currentNode, data) {
      const  node = this.constructorNode(data);
      this.insertNode(currentNode, node);
    };

    //给节点添数据
    this.constructorNode = function( data ) {
      const node = new LinkListNode();
      node.setValue(data) ;
      return node;
    };

  };


  getDuLinkList() {
    return  new this.DuLinkList();
  }




}
