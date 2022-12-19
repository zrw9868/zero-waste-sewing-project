import React, { useState, useEffect, useRef } from 'react'
import { Line, Circle, Group, Arrow, Image} from 'react-konva'
import useImage from "use-image";
import { min, max } from 'mathjs';
import {getPoints} from './Shape/Edge.js'

function PolygonGroup(props) {
  const {
    id,
    tool,
    face,
    renderE,
    width,
    handleLineOnClick,
    setSelectedGrp,
    setMouseOverLine,
    lineSelected,
    setLineSelected
  } = props;

  const grpRef = useRef(null);
  //const src = "https://img.freepik.com/free-vector/decorative-plaid-style-background-design_1048-17207.jpg?w=1060&t=st=1669060668~exp=1669061268~hmac=685f00ae5575b8e4b88893be3fd8a1d96f343c269b3bfca95a1daed7e1dc78d9"
  //const src = "https://pixabay.com/get/g3ede1308c2efcddc7ab81f1acfc8893d325a600f7fa5d36c5508567b0e8357f96122d04d130a174c06d2c4018ae68857_640.jpg"
   const src = "https://img.freepik.com/free-vector/pastel-coloured-plaid-style-pattern-background_1048-16884.jpg?w=1480&t=st=1670287964~exp=1670288564~hmac=4062f3fbeed64f7a8f301f85da60da922ab4aaccc7f7fa7ce095ab9867a62282"
  //const src = "https://cdn.pixabay.com/photo/2015/09/12/23/45/checks-937564_1280.jpg";

  const [image] = useImage(src)
  const getFlattenedPoints = (face) => {
    let flat = face.e.map((idx) => getPoints(renderE[idx]))
    return movePoints(flat, width + 50, 0)

  }

  const movePoints = (listOfFlatPoints, x, y) => {
    return listOfFlatPoints.map((e) => [e[0]+x, e[1]+y, e[2]+x, e[3]+y])
  }

	const [stage, setStage] = useState()
  const [flattened, setflattened] = useState(getFlattenedPoints(face))

  useEffect(() => {
    setflattened(getFlattenedPoints(face))
  }, [face])

  const handleGroupMouseOver = (e) => {

    if (tool == "transform") {
      e.target.getStage().container().style.cursor = 'move'
      setStage(e.target.getStage())
      setSelectedGrp(grpRef)
    }

	}

	const handleGroupMouseOut = (e) => {
    if (tool == "transform") {
      e.target.getStage().container().style.cursor = 'default'
      setSelectedGrp(null)
    }

  }

  const handleLineMouseOver = (e) => {
    e.target.stroke("orange")
    e.target.strokeWidth(8)
    setMouseOverLine(true)
    setLineSelected(face.e[e.target.index - 1])

  }

  const handleLineMouseOut = (e) => {
    e.target.stroke(renderE[lineSelected].color)
    e.target.strokeWidth(5)
    setMouseOverLine(false)
  }

  return (
    <Group
      name={"polygon" + parseInt(id)}
      ref = {grpRef}
      onMouseOver={handleGroupMouseOver}
      onMouseOut={handleGroupMouseOut}
      draggable = {tool == "transform"}
    >
    <Line
        points={flattened.reduce((prev, cur) => prev.concat([cur[0], cur[1]]), [])}
        stroke= {"black"}
        strokeWidth={3}
        fillPatternImage = {image}
        fillPatternOffset = {{x:-50, y: 50}}
        fillPatternScale = {{x: 0.2, y: 0.2}}
        opacity = {1}
        closed
    />
    {flattened.map((points, i) => 
      {
        let edge = renderE[face.e[i]]
        // if (edge.render == -1) {
        //   points = [points[2], points[3], points[0], points[1]]
        // }
        // if (edge.pair > -1) {
        //   return (<Arrow 
        //     key={i}
        //     points={points}
        //     stroke= {edge.color}
        //     strokeWidth={5}
        //     tension={0.5}
        //     lineCap="round"
        //     lineJoin="round"
        //     pointerLength= {10}
        //     pointerWidth ={10}
        //     fill = {edge.color}
        //     onMouseOver={handleLineMouseOver}
        //     onMouseOut={handleLineMouseOut}
        //     onClick = {handleLineOnClick}
        // />
        // )}
        return (
        <Line
          key={i}
          points={points}
          stroke= {edge.color}
          strokeWidth={5}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          onMouseOver={handleLineMouseOver}
          onMouseOut={handleLineMouseOut}
          onClick = {handleLineOnClick}
        />)}
      )}
    </Group>
  )

  };

export default PolygonGroup;