import { Injectable } from '@angular/core';

/**
 * Stack 类
 */
class Stack {
  public data = [];
  public top = 0;
  constructor() {
    this.data = []; // 对数据初始化
    this.top = 0; // 初始化栈顶位置
  }

  // 入栈方法
  push(attr) {
    const args = attr;
    args.forEach(arg => this.data[this.top++] = arg);
    return this.top;
  }

  // 出栈方法
  pop() {
    if (this.top === 0) {
      throw new Error('The stack is already empty!');
    }
    const peek = this.data[--this.top];
    this.data = this.data.slice(0, -1);
    return peek;
  }

  // 返回栈顶元素
  peek() {
    return this.data[this.top - 1];
  }

  // 返回栈内元素个数
  length() {
    return this.top;
  }

  // 清除栈内所有元素
  clear() {
    this.top = 0;
    return this.data = [];
  }

  // 判断栈是否为空
  isEmpty() {
    return this.top === 0;
  }
}

@Injectable()
export class DataStackService {

  constructor() {

  }
  public status = false;

  checkISEmpty(string) {
    const stack = new Stack();
    stack.data = [];
    stack.top = 0;
    const stringArry = string.split('');
    this.status = false;
    if (!stringArry.length) {
      return false;
    }
    stringArry.forEach(item => {
      if (item === '{') {
        stack.push([item]);
      }
      if ((stack.top > 0) && item !== '{' && item !== '}') {
        stack.push([item]);
      }
      if (item === '}') {
        //返回栈顶元素
        const topEle = stack.pop();
        if (!this.status) {
          this.status = topEle === '{' ? true : false;
        }
        if (!this.status) {
          //清除栈，继续往下走
          stack.clear();
          stack.push([item]);
        }
      }

    });

  }

  getStatus(string) {
    this.checkISEmpty(string);

    return this.status;
  }

}
