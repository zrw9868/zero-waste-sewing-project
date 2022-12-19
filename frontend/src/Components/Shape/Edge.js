import {getPoint} from './Vertex.js'

export function Edge(v1,v2){
	return { v : [v1,v2],
			 pair: -1,
			 color: "blue",
			 render: 1
			}
}

export function getEdges(v) {
  return [Edge(v[0], v[1]),
          Edge(v[1], v[2]), 
          Edge(v[2], v[3]),
          Edge(v[3], v[0])]
}

export function getPoints(e) {
	return getPoint(e.v[0]).concat(getPoint(e.v[1]))
	// if (e.render == 1) {
	// 	return getPoint(e.v[0]).concat(getPoint(e.v[1]))
	// } else {
	// 	return getPoint(e.v[1]).concat(getPoint(e.v[0]))
	// }

}

export function setEdgePair(e, count, color = "#0000FF") {
	e.pair = count
	e.color = color
}

export function setRender(e) {
	e.render = e.render * -1
}

