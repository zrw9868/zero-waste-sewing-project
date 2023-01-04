import {floor} from 'mathjs';
import {setEdgePair} from '../Shape/Edge.js'

export function generateColor(colors) {
	while (true) {
		let color = "#" + floor(Math.random()*16777215).toString(16);
	
		if ( ! colors.has(color)) {
			return color
		}
	}
}

export function addPair(renderE, edges, idx, count, color) {
	setEdgePair(renderE[idx], count, color)
    setEdgePair(edges[idx], count)
}

export function resetPair(renderE, edges, idx) {
	for (let i = 0; i < idx.length; i++){
		setEdgePair(renderE[idx[i]], -1)
  		setEdgePair(edges[idx[i]], -1)
	}

}

export function removePairOnCut(renderE, edges, pairs, toBeRemoved) {
	for(let i = 0; i < toBeRemoved.length; i++) {
		let pairId = edges[toBeRemoved[0]].pair
		if (pairId != -1) {
			resetPair(renderE, edges, pairs.get(pairId))
		}
	}

}