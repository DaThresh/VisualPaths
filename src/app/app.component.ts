import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  width = 0;
  height = 0;
  boxDimensions = 25;
  graph = new Graph();
  startNode:object = null;
  endNode:object = null;

  isMouseDown:boolean = false;
  makeBorders:boolean = false;

  ngOnInit(){
    this.getDimensions();
    this.drawBoxes(true);
    this.graph.setDimensions(this.height, this.width, this.boxDimensions);
  }

  getDimensions(){
    let topBarHeight = document.querySelector('#top-bar').clientHeight;
    this.height = window.screen.height - topBarHeight;
    this.width = window.screen.width;
  }

  drawBoxes(creation:boolean){
    let container = document.querySelector('#container');
    let html = '';
    for(var i = 0; i < Math.trunc(this.height / this.boxDimensions); i++){
      html += '<div class="row">';
      for(var j = 0; j < Math.trunc(this.width / this.boxDimensions); j++){
        let id = i + '_' + j;
        if(creation){
          this.graph.addNode(id);
        }
        html += '<div class="square';
        if(this.startNode != null && this.startNode['id'] == id){
          html += ' startNode';
        } else if (this.endNode != null && this.endNode['id'] == id){
          html += ' endNode';
        } else if (this.graph.nodeListObj[id].border){
          html += ' is-border';
        }
        html += '" id="' + id + '"></div>';
      }
      html += '</div>';
    }
    container.innerHTML = html;
    if(!container.classList.contains('fade-in')){
      container.classList.add('fade-in');
    }
  }

  clickBox(event){
    if(event.target.id != 'container' && typeof this.graph.nodeListObj[event.target.id] != 'undefined'){
      let clickedNode = this.graph.nodeListObj[event.target.id];
      let changed = false;
      if(this.startNode == null){
        this.startNode = clickedNode;
        changed = true;
      } else if (this.endNode == null && this.startNode != clickedNode){
        this.endNode = clickedNode;
        changed = true;
      } else if (this.startNode == clickedNode || this.endNode == clickedNode){
        this.startNode = null;
        this.endNode = null;
        changed = true;
      } else {
        this.startNode = clickedNode;
        this.endNode = null;
        changed = true;
      }
      if(changed){
        this.drawBoxes(false);
      }
    }
  }

  mouseDown(isMouseDown){
    if(isMouseDown){ this.isMouseDown = true; }
    else { this.isMouseDown = false; }
  }

  mouseOver(event){
    if(this.isMouseDown && this.makeBorders){
      if(event.target.id != 'container' && typeof this.graph.nodeListObj[event.target.id] != 'undefined'){
        this.graph.nodeListObj[event.target.id].border = true;
        event.target.classList.add('is-border');
      }
    }
  }

  toggleBorders(event){
    if(event.target.classList.contains('is-active')){
      event.target.classList.remove('is-active');
      this.makeBorders = false;
    } else {
      event.target.classList.add('is-active');
      this.makeBorders = true;
    }
  }

  startPathfinding(){
    if(this.startNode && this.endNode){
      console.log('Pathfinding....');
    }
  }

  pathfind(){
    if(this.startNode && this.endNode){

    }
  }
}

class Graph {
  nodeListObj:Object = {};
  width:number;
  height:number;
  boxDimensions:number;
  foundPath:boolean = false;

  addNode(id){
    let newNode = new Node(id);
    this.nodeListObj[id] = newNode;
    let coords = this.translate(id);
    if(coords[0] - 1 >= 0){
      let top = this.nodeListObj[String(coords[0] - 1) + '_' + String(coords[1])];
      top.bottom = newNode;
      newNode.top = top;
    }
    if(coords[1] - 1 >= 0){
      let left = this.nodeListObj[String(coords[0]) + '_' + String(coords[1] - 1)];
      left.right = newNode;
      newNode.left = left;
    }
  }

  setDimensions(y:number,x:number, boxDimensions:number){
    this.height = y;
    this.width = x;
    this.boxDimensions = boxDimensions;
  }

  translate(id:string){
    // sCoords stands for String Coords
    // Typescript doesnt like type changing in arrays
    let sCoords = ['', ''];
    for(var i = 0, onX = false; i < id.length; i++){
      if(id[i] == '_'){
        onX = true;
        continue;
      } else if (!onX){
        sCoords[0] += id[i];
      } else {
        sCoords[1] += id[i];
      }
    }
    let coords = [];
    coords[0] = parseInt(sCoords[0]);
    coords[1] = parseInt(sCoords[1]);
    // returns [y,x]
    return coords;
  }

  pathfindInner(source:object,end:object,visited){
    if(visited.includes(source) || this.foundPath){
      return;
    }
    let paths = [];
    let directions = ['top', 'bottom', 'left', 'right'];
    visited.push(source);
    for(var i = 0; i < directions.length; i++){
      if(source[directions[i]] == end){
        this.foundPath = true;
        break;
      }
    }
    if(this.foundPath){
      setTimeout(() => {
        this.foundPath = false;
      }, 10);
      return [[ source, directions[i] ]];
    } else {
      !source['left']['border'] ? paths.concat(this.pathfindInner(source['left'],end,visited)) : false;
      !source['right']['border'] ? paths.concat(this.pathfindInner(source['right'],end,visited)) : false;
      !source['top']['border'] ? paths.concat(this.pathfindInner(source['top'],end,visited)) : false;
      !source['bottom']['border'] ? paths.concat(this.pathfindInner(source['bottom'],end,visited)) : false;
      return paths;
    }
  }
}

class Node {
  top:object = null;
  bottom:object = null;
  left:object = null;
  right:object = null;
  border:boolean = false;
  id:string;

  constructor(id:string){
    this.id = id;
    return this;
  }
}
