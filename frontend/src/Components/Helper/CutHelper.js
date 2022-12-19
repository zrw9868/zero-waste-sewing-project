import { min, max, floor, sqrt } from 'mathjs';
import {Vertex, getVertices } from '../Shape/Vertex.js'
import {Edge, getEdges} from '../Shape/Edge.js'
import {Face, getFaces} from '../Shape/FaceWithEdges.js'


/*
 Find the intersection point of two lines defined by two points respectively.
*/
export function intersection(line1, line2) {

	const [x1,y1,x2,y2] = line1
	const [x3,y3,x4,y4] = line2

	var [slope1, intercept1] = slopeIntercept(x1,y1,x2,y2)
	var [slope2, intercept2] = slopeIntercept(x3,y3,x4,y4)
	var pos;

	if (slope1 === false) {
		pos = [intercept1, intercept1 * slope2 + intercept2] 
	} else if (slope2 === false) {
		pos = [intercept2, intercept2 * slope1 + intercept1]
	} else {
		var x = (intercept2 - intercept1) / (slope1 - slope2)
		var y = slope1 * x + intercept1
		pos = [x, y]
	}
	return Vertex(pos[0], pos[1])

}

/*
 Find slope and intercept of a line defined by two points.
 if the line is a verticla line, the slope is False.
*/
function slopeIntercept(x1,y1,x2,y2) {
	var slope;
	var intercept;

	if (x1 == x2) {
		slope = false;
		intercept = x1;
	} 
	else {
		slope = (y2-y1) / (x2 - x1);
		intercept = y1- slope * x1;
	}

	return [slope, intercept]

}


/*
 snap the two points in cut line onto the two refLines. If offset > 0, 
 cut line is moved inward by offset. 
 */
export function snapCut(E, V, refLines, cut, offset) {

	var [v1, v2] = E[refLines[0]].v
	var points = v1.p.concat(v2.p)
	var halfEdge1 = [cut[0], cut[1], cut[2], cut[3]]

	var [v3, v4] = E[refLines[1]].v
	var points2 = v3.p.concat(v4.p)
  var halfEdge2 = [cut[2], cut[3], cut[0], cut[1]]

  if (offset > 0) {
    	halfEdge1 = moveLineInNormDir(halfEdge1, offset)
    	halfEdge2 = moveLineInNormDir(halfEdge2, offset)
  } 

	var start1 = intersection(points, halfEdge1)
	var end1 = intersection(points2, halfEdge1)
	//console.log("halfedge1: " + start1 + ", "+ end1)


	var start2 = intersection(points2, halfEdge2)
	var end2 = intersection(points, halfEdge2)
	//console.log("halfedge2: " + start2 +"," +  end2)

	let l = E.length

	if (offset == 0) {
      	V.push(start1, end1)

      	E.splice(refLines[0], 1, Edge(v1, start1))
      	E.splice(refLines[1], 1, Edge(v3, end1))
      	// l, l+1
      	E.push(Edge(start1,v2), Edge(end1, v4))
      	// l+2
      	E.push(Edge(start1, end1))
      	// l+3
      	E.push(Edge(end1, start1))

	} else {
		V.push(start1, end1, start2, end2)
      	let len = V.length

      	E.splice(refLines[0], 1, Edge(v1, start1))
      	E.splice(refLines[1], 1, Edge(v3, start2))
      	// l, l+1
      	E.push(Edge(end2, v2), Edge(end1, v4))
      	// l+2
      	E.push(Edge(start1, end1))
      	// l+3
      	E.push(Edge(start2, end2))
	}

	return [[refLines[0], l+2, l+1], [refLines[1], l+3, l]]
}

/*
 Move a line in its normal direction by offset.
 */
function moveLineInNormDir(line, offset) {
	const [x1,y1,x2,y2] = line;
	var dy = y2 - y1;
	var dx = x2 - x1;
	var norm = sqrt(dy * dy + dx * dx);
	var normal = [ - dy * offset / norm, dx * offset / norm];

	return [x1+normal[0], y1+normal[1], x2+normal[0], y2+normal[1]];
}

/*
delete face defined by edges.
*/
export function deleteFaceV2(faces, edges, refLines) {
	var first
	var second 
	var found = []

  for (let i = 0; i < faces.length; i++) {
    let faceEdges = faces[i].e
    found = []
    // check if the face has required two cut lines
    for (let j = 0; j < faceEdges.length; j++) {
      for (let k = 0; k<2; k++) {
        if (faceEdges[j] == refLines[k])  {
          found.push(j)
        }
      }
    }

    if (found.length == 2) {
      // find the two sides of consecutive vertices
      first = faceEdges.slice(found[0]+1, found[1])
      second = [].concat(faceEdges.slice(found[1]+1, faceEdges.length), faceEdges.slice(0, found[0]))

      // delete the face 
      faces.splice(i, 1)
      break
    }
  }
  return [first, second] 

}

/*
add face defined by edges.
*/
export function addNewFacesV2(faces, edges, first, second, new1, new2) {
    if (edges[first[first.length-1]].v[1] == edges[new1[0]].v[0]) {
      first = first.concat(new1)
      second = second.concat(new2)
    } else {
      first = first.concat(new2)
      second = second.concat(new1)
    }
    faces.push(Face(first), Face(second))
}

/*
delete face defined by vertices.
*/
export function deleteFace(faces, edges, refLines) {
	var first 
  var second 
  var face
  var found = []

  for (let i = 0; i < faces.length; i++) {
    face = faces[i].v
    found = []
    // check if the face has required two cut lines
    for (let j = 0; j < face.length; j++) {
      for (let k = 0; k<2; k++) {
        let temp = edges[refLines[k]].v
        if ((face[j] == temp[0] && face[(j+1)%face.length] == temp[1]) || 
          (face[j] == temp[1] && face[(j+1)%face.length] == temp[0])) {
          found.push(j)
        }
      }
    }

    if (found.length == 2) {
      // find the two sides of consecutive vertices
      first = face.slice(found[0]+1, found[1]+1)
      second = [].concat(face.slice(found[1]+1, faces[i].length), face.slice(0, found[0]+1))

      // delete the face 
      faces.splice(i, 1)
      break
    }
  }
  //console.log(first)
  //console.log(second)
  return [first, second] 
}

/*
add face defined by vertices.
*/
export function addNewFaces(faces, v, first, second, to_add_1, to_add_2) {

    if (first[first.length-1] == v) {
      first.push(to_add_1, to_add_2)
      second.push(to_add_2, to_add_1)
    } else {
      second.push(to_add_1, to_add_2)
      first.push(to_add_2, to_add_1)
    }
    faces.push(Face(first), Face(second))
}


