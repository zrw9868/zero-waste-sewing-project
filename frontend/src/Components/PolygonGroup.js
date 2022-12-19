import React, { useState, useEffect } from 'react'
import { Line, Circle, Group } from 'react-konva'
import { min, max } from 'mathjs';
import {Face, getFlattenedPoints, moveFace} from './Shape/Face.js'

function PolygonGroup(props) {
  const {
    face,
    width
  } = props;

	const [stage, setStage] = useState()
  const [polygon, setPolygon] = useState(moveFace(face, width + 50, 0))
  console.log(getFlattenedPoints(polygon))

  useEffect(() => {
    setPolygon(moveFace(face, width + 50, 0))
  }, [face])

  const handleGroupMouseOver = (e) => {
		e.target.getStage().container().style.cursor = 'move'
		setStage(e.target.getStage())
	}

	const handleGroupMouseOut = (e) => {
    e.target.getStage().container().style.cursor = 'default'
  }

  const minMax = (arr) => {
  	return [min(arr), max(arr)]

  }

  const [minMaxX, setMinMaxX] = useState([0, 0]) //min and max in x axis
  const [minMaxY, setMinMaxY] = useState([0, 0]) //min and max in y axis
  const handleGroupDragStart = (e) => {
    let points = polygon.v
    let arrX = points.map((vi) => vi.p[0])
    let arrY = points.map((vi) => vi.p[1])
    setMinMaxX(minMax(arrX))
    setMinMaxY(minMax(arrY))
  }

  const groupDragBound = (pos) => {
    let { x, y } = pos
    const sw = stage.width()
    const sh = stage.height()
    if (minMaxY[0] + y < 0) y = -1 * minMaxY[0]
    if (minMaxX[0] + x < width + 100 ) x = width + 100 - minMaxX[0]
    if (minMaxY[1] + y > sh) y = sh - minMaxY[1]
    if (minMaxX[1] + x > sw) x = sw - minMaxX[1]
    return { x, y }
  }

  const handleGroupDragEnd = (e) => {
    //drag end listens other children circles' drag end event
    //...that's, why 'name' attr is added, see in polygon annotation part
    let newPolygon = moveFace(polygon, e.target.x(), e.target.y())
    e.target.position({ x: 0, y: 0 }) //needs for mouse position otherwise when click undo you will see that mouse click position is not normal:)
    setPolygon(newPolygon)
  }

  // const circleDragBound = (pos) => {
  // 	let { x, y } = pos
  //   const sw = stage.width()
  //   const sh = stage.height()
  //   if (minMaxY[0] + y - vertexRadius < 0) y = vertexRadius - minMaxY[0]
  //   if (minMaxX[0] + x - vertexRadius < 0) x = vertexRadius - minMaxX[0]
  //   if (minMaxY[1] + y + vertexRadius > sh) y = sh - vertexRadius - minMaxY[1]
  //   if (minMaxX[1] + x + vertexRadius > sw) x = sw - vertexRadius - minMaxX[1]
  //   	return {x, y}
  // }

  return (
    <Group
      name="polygon"
      onDragStart={handleGroupDragStart}
      onDragEnd={handleGroupDragEnd}
      dragBoundFunc={groupDragBound}
      onMouseOver={handleGroupMouseOver}
      onMouseOut={handleGroupMouseOut}
      draggable
    >
    <Line
        points={getFlattenedPoints(polygon)}
        stroke= {"blue"}
        strokeWidth={3}
        closed
      />
    </Group>
  )

  };

export default PolygonGroup;