// class Vertex {
//   constructor(x, y) {
//     this.point = [x,y]
//   }
// }

export function Vertex(x, y){
	return {
    p :[x, y]
  }
}

export function getVertices(width, height, lt_x, lt_y, offset) {
  return [Vertex(lt_x + offset, lt_y + offset), 
           Vertex(lt_x+width - offset, lt_y + offset),
           Vertex(lt_x+width - offset, lt_y+height- offset),
           Vertex(lt_x+ offset, lt_y+height- offset)]
}

export function getPoint(v){
  return v.p
}