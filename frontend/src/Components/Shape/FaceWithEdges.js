import {Edge, getPoints} from "./Edge.js"


export function Face(edges){
	return {
		e: edges
	}
}

export function getFaces(e) {
  return [Face(e)]
}