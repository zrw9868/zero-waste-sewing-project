import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Line, Text } from 'react-konva';


import ModeBar from './ModeBar.js';
import PolygonGroup from './PolygonGroup.js'

function AdvancedCanvas() {
  const [points, setPoints] = useState([])
  const [flattenedPoints, setFlattenedPoints] = useState([])
  const [isMouseOverPoint, setMouseOverPoint] = useState(false)
  const [tool, setTool] = React.useState("pen");
  const [position, setPosition] = useState([0, 0])
  const [isPolyComplete, setPolyComplete] = useState(false);

  const getMousePos = (stage) => {
    return [stage.getPointerPosition().x, stage.getPointerPosition().y]
  }

  // drawing when mousedown event is fired.
  const handleMouseDown = (e) => {
    if (isPolyComplete || ! (tool === "pen")) return

    const stage = e.target.getStage()
    const mousePos = getMousePos(stage)

    if (isMouseOverPoint && points.length >= 3) {
      setPolyComplete(true)
    } else {
      setPoints([...points, mousePos])
    }
    console.log(points)
  }

  const handleMouseMove = (e) => {
    const stage = e.target.getStage()
    const mousePos = getMousePos(stage)
    setPosition(mousePos)
  }

  // check if mouse is over starting point
  const handleMouseOverStartPoint = (e) => {
    if (isPolyComplete || points.length < 3) return
    e.target.scale({ x: 3, y: 3 })
    setMouseOverPoint(true)
  }

  const handleMouseOutStartPoint = (e) => {
    e.target.scale({ x: 1, y: 1 })
    setMouseOverPoint(false)
  }

  const handlePointDragMove = (e) => {
    const stage = e.target.getStage()
    const index = e.target.index - 1
    const pos = [e.target._lastPos.x, e.target._lastPos.y]
    if (pos[0] < 0) pos[0] = 0
    if (pos[1] < 0) pos[1] = 0
    if (pos[0] > stage.width()) pos[0] = stage.width()
    if (pos[1] > stage.height()) pos[1] = stage.height()
    setPoints([...points.slice(0, index), pos, ...points.slice(index + 1)])
  }

  useEffect(() => {
    setFlattenedPoints(
      points.concat(isPolyComplete ? [] : position).reduce((a, b) => a.concat(b), [])
    )
  }, [points])

  const handleGroupDragEnd = (e) => {
    //drag end listens other children circles' drag end event
    //...that's, why 'name' attr is added, see in polygon annotation part
    if (e.target.name() === 'polygon') {
      let result = []
      let copyPoints = [...points]
      copyPoints.map((point) => result.push([point[0] + e.target.x(), point[1] + e.target.y()]))
      e.target.position({ x: 0, y: 0 }) //needs for mouse position otherwise when click undo you will see that mouse click position is not normal:)
      setPoints(result)
    }
  }

  const clear = (e) => {
    setPoints([]);
    setFlattenedPoints([]);
    setPolyComplete(false);
  }

  return (
    <div>
      <ModeBar 
        tool = {tool}
        setTool = {setTool}
        clear = {clear}
      />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      >
        <Layer>
          <PolygonGroup 
            points = {points}
            flattenedPoints={flattenedPoints}
            handlePointDragMove={handlePointDragMove}
            handleGroupDragEnd={handleGroupDragEnd}
            handleMouseOverStartPoint={handleMouseOverStartPoint}
            handleMouseOutStartPoint={handleMouseOutStartPoint}
            isFinished={isPolyComplete}
          />
        </Layer>
      </Stage>
    </div>
  )


}

export default AdvancedCanvas;