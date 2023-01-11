import { min, max, floor, sqrt } from 'mathjs';
import {Vertex, getVertices } from '../Shape/Vertex.js'
import {Edge, getEdges, getPoints} from '../Shape/Edge.js'
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
    // for triangles
    if (first.length == 0 || second.length == 0) {
      if (edges[new1[new1.length-1]].v[1] == edges[new1[0]].v[0]) {
        second = [].concat(first, second, new2)
        first = new1
      } else {
        first = [].concat(first, second, new1)
        second = new2
      }

    } else {
      // for rectangles and polygons
      if (edges[first[first.length-1]].v[1] == edges[new1[0]].v[0]) {
        first = first.concat(new1)
        second = second.concat(new2)
      } else {
        first = first.concat(new2)
        second = second.concat(new1)
      }
    }
    faces.push(Face(first), Face(second))
}

/*
Check if the two given edges can be merged together
*/
export function canMerge(e1, e2) {
  let [x1,y1,x2,y2] = getPoints(e1)
  let [x3,y3,x4,y4] = getPoints(e2)
  // console.log([x1,y1,x2,y2])
  // console.log([x3,y3,x4,y4])

  let [slope1, intercept1] = slopeIntercept(x1,y1,x2,y2)
  let [slope2, intercept2] = slopeIntercept(x4,y4,x3,y3)
  //TODO also need to check if they overlap
  // console.log([slope1, intercept1])
  // console.log([slope2, intercept2])

  if (slope1 === false) {
    return slope2 === false && (intercept2 - intercept1) < 0.00001
  } else {
    return (slope1 - slope2) < 0.00001 && (intercept2 - intercept1) < 0.00001
  }

}


export function merge(faces, edges, vertices, renderE, renderF, renderV, e1, e2) {
  // find two faces of the two edges

  var first
  var second 
  var found = []

  for (let i = 0; i < faces.length; i++) {
    let faceEdges = faces[i].e
    for (let j = 0; j < faceEdges.length; j++) {
      if (faceEdges[j] == e1)  {
        first = [].concat(faceEdges.slice(j+1, faceEdges.length), faceEdges.slice(0, j))
        found.push(i)
        break
      }
      if (faceEdges[j] == e2)  {
        second = [].concat(faceEdges.slice(j+1, faceEdges.length), faceEdges.slice(0, j))
        found.push(i)
        break
      }

    }
    if (found.length === 2) {
      break
    }
  }

  console.log(first)
  console.log(second)
  // delete two faces
  // let new_faces = faces.filter((value, i) => ! found.includes(i))
  // let new_renderF = renderF.filter((value, i) => ! found.includes(i))
  // console.log(new_faces)
  // console.log(new_renderF)
  faces.splice(found[1], 1)
  faces.splice(found[0], 1)
  renderF.splice(found[1], 1)
  renderF.splice(found[0], 1)


  //delete edges and 
  let [x1,y1,x2,y2] = getPoints(edges[e1])
  let [x3,y3,x4,y4] = getPoints(edges[e2])
  let new_f = mergeEdges(first, second, edges, vertices, e1, e2, x1 === x4 && y1 == y4, x3 === x2 && y3 == y2)
  let new_rf = mergeEdges(first, second, renderE, renderV, e1, e2, x1 === x4 && y1 == y4, x3 === x2 && y3 == y2, true)
  console.log(new_f)
  console.log(new_rf)

  //add back newly merged face
  faces.push(new_f)
  renderF.push(new_rf)

  // return [new_faces, new_renderF]

}

/*

*/
export function mergeEdges(first, second, edges, vertices, e1, e2, exactOpposite1, exactOpposite2, render=false) {
  let edge1 = edges[e1]
  let edge2 = edges[e2]

  let [v1,v2] = edges[e1].v
  let [v3, v4] = edges[e2].v
  let final = []

  let i1 = vertices.indexOf(v1)
  let i2 = vertices.indexOf(v2)
  let i3 = vertices.indexOf(v3)
  let i4 = vertices.indexOf(v4)


  edges.splice(e1, 1, null)
  edges.splice(e2, 1, null)

  if (exactOpposite1) {
    edges.splice(first[first.length-1], 1, Edge(edges[first[first.length-1]].v[0], edges[second[0]].v[1]))
    edges.splice(second[0], 1, null)
    
    vertices.splice(i1, 1, null)
    vertices.splice(i4, 1, null)

    //TODO recursively merge edges

    final = [].concat(first.slice(1, first.length), second.slice(1, second.length-1))
  
  } else {
    if (render) {
      // find intersection point of 
      let new_v = intersection(getPoints(edges[first[first.length-1]]), getPoints(edge2))
      
      vertices.splice(i1, 1, new_v)
      edges.splice(first[first.length -1], 1, Edge(first[0].v[1], new_v))

    } 
    edges.splice(e1, 1, Edge(vertices[i1], v4))
    final = [].concat(first.slice(1, first.length), [e1], second.slice(0, second.length-1))
  }

  if (exactOpposite2) {
    edges.splice(second[second.length-1], 1, Edge(edges[second[second.length-1]].v[0], edges[first[0]].v[1]))
    edges.splice(first[0], 1, null)
    
    vertices.splice(i3, 1, null)
    vertices.splice(i2, 1, null)

    //TODO recursively merge edges??

    final.push(second[second.length-1])
  } else {

    if (render) {

      // find intersection point of 
      console.log(edges[first[0]].v[0])
      let new_v = intersection(getPoints(edges[first[0]]), getPoints(edge2))
      console.log(new_v)
      
      vertices.splice(i2, 1, new_v)
      edges.splice(first[0], 1, Edge(new_v, edges[first[0]].v[1]))

    } 
    edges.splice(e2, 1, Edge(v3, vertices[i2]))
    final.push(second[second.length-1], e2,first[0])
  }

  return Face(final)
}


