import {Vertex, getPoint} from "./Vertex.js" 

export function Face(vertices){
	return {
		v: vertices
	}
}

export function getFaces(v) {
  return [Face(v)]
}

export function getFlattenedPoints(f) {
	let output = []
	for (let i = 0; i< f.v.length; i++) {
		output = output.concat(getPoint(f.v[i]))
	}
	return output
}

export function getVertices(f) {
	return f.v
}

export function moveFace(f,drag_width, drag_height) {
	let output = []
	for (let i = 0; i< f.v.length; i++) {
		let pp = getPoint(f.v[i])
		output.push(Vertex(pp[0] + drag_width, pp[1] + drag_height))
	}
	return Face(output)

}