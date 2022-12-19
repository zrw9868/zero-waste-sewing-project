import React, { useState, useEffect, useRef } from 'react'
import { abs, round } from 'mathjs';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Line, Arrow, Text, Transformer} from 'react-konva';
import { min, max, floor  } from 'mathjs';


import {intersection, snapCut, addNewFacesV2, deleteFaceV2} from './Helper/CutHelper.js';
import {generateColor, addPair, resetPair, changeDir, removePairOnCut} from './Helper/CorrespondenceHelper.js'
import {Vertex, getVertices, getPoint } from './Shape/Vertex.js'
import {Edge, getEdges, getPoints} from './Shape/Edge.js'
import {Face, getFaces} from './Shape/FaceWithEdges.js'
import PolygonGroup from './PolygonGroupWithEdges.js'

import ModeBar from './ModeBar.js';

function CutOutCanvasV2() {

  const [tool, setTool] = useState("cut");
  const [pairFunction, setPairFunction] = useState();

  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);

  // cutting panel starting point
  const lt_x= floor(50)
  const lt_y = floor(70)
  // shrink offset
  const offset = 10 

  /* The cutting panel is set to be a retangle with size (width * height)
    For rendering purposes, the vertices are shrinked by offset.

    Vertices/renderV: a list of points [p_x, p_y]
    Edges/renderE: a list of lines [vertex_idx1, vertex_idx2], 
                  only renderE can be selected or cut
    faces: a list of faces [vertex_idx1, vertex_idx2, vertex_idx3]
  */
  const [vertices, setVertices] = useState(getVertices(width, height, lt_x, lt_y, 0));
  const [renderV, setRenderV] = useState(getVertices(width, height, lt_x, lt_y, offset));
  const [edges, setEdges] = useState(getEdges(vertices));
  const [renderE, setRenderE] = useState(getEdges(renderV));
  const [faces, setFaces] = useState(getFaces([0,1,2,3]));
  const [renderF, setRenderF] = useState(getFaces([0,1,2,3]));

  /*In editing mode, users can cut the panel in to two pieces 
  by selecting two sides: {refLines} to cut, the cutting two points
  are stored in {cut}

  cut: a list of points coordinates [p1_x, p1_y, p2_x, p2_y]
  refLine: a list of edges selected [edge_idx, edge_idx]

  */
  const [cut, setCut] = useState([]);
  const [refLines, setRefLines] = useState([])
  const [lineSelected, setLineSelected] = useState([]);
  const [mouseOverLine, setMouseOverLine] = useState(false);

  const [pair, setPair] = useState([]);
  const [pairs, setPairs] = useState(new Map());
  const [count, setCount] = useState(0);
  const [color, setColor] = useState("#0000FF");
  const [colors, setColors] = useState(new Set(["#0000FF", "#FFA500", "#FFFF00"]));

  useEffect(() => {
    let v = getVertices(width, height, lt_x, lt_y, 0)
    let rv = getVertices(width, height, lt_x, lt_y, offset)
    let e = getEdges(v)
    let re = getEdges(rv)
    setVertices(v)
    setRenderV(rv)
    setEdges(e)
    setRenderE(re)
    setFaces(getFaces([0,1,2,3]))
    setRenderF(getFaces([0,1,2,3]))
  }, [width, height])


  const handleLineMouseOver = (e) => {
    e.target.stroke("orange")
    e.target.strokeWidth(8)
    setMouseOverLine(true)
    setLineSelected(e.target.index - 1)

  }

  const handleLineMouseOut = (e) => {
    e.target.stroke(renderE[lineSelected].color)
    e.target.strokeWidth(5)
    setMouseOverLine(false)
  }

  const handleLineOnClick = (e) => {
    if (tool != "pen") return
    if(mouseOverLine && pairFunction == "add") {
      if (pair.length == 1) {
        //check for valid pair 
        if (renderE[lineSelected].pair == -1) {
          colors.add(color)
          addPair(renderE, edges, lineSelected, count, color)
          pairs.set(count, [pair[0], lineSelected])

          setColors(colors)
          setPairs(pairs)
          setCount(count+1)
        } else {
          resetPair(renderE, edges, pair)
        }
        setPair([])
      }
      else {
        //pair already set for the current edge, 
        if (renderE[lineSelected].pair != -1) {
          changeDir(renderE, edges, lineSelected)
        } else {
          let color = generateColor(colors)
          addPair(renderE, edges, lineSelected, count, color)

          setColor(color)
          setPair([lineSelected])
        }
      }
    } else if (mouseOverLine && pairFunction == "remove") {
      removePairOnCut(renderE, edges, pairs, [lineSelected])
    }
    setRenderE(renderE)
    setEdges(edges)

  }


  const handleMouseDown = (e) => {
    if ( tool !== "cut" || cut.length !== 0) return
    const pos = e.target.getStage().getPointerPosition();
    if (mouseOverLine) {
      setCut([pos.x, pos.y])
      setRefLines([lineSelected])
    }
    
  }

  const handleMouseMove = (e) => {
    // no cutting - skipping
    if ( tool !== "cut" || cut.length < 2) return
    const pos = e.target.getStage().getPointerPosition();
    
    setCut([cut[0],cut[1], pos.x-3, pos.y-3])

    if (mouseOverLine) {
      // add point
      setRefLines([refLines[0], lineSelected])
      
    }
  };

  const handleMouseUp = (e) => {
    // no drawing skipping
    if (tool !== "cut" || cut.length !== 4) return

    if (refLines.length < 2) {
      setCut([])
      setRefLines([])
      return
    }

    const pos = e.target.getStage().getPointerPosition();
    setCut([cut[0],cut[1], pos.x, pos.y])

    removePairOnCut(renderE, edges, pairs, refLines)

    // delete face that the current cut affects, 
    // and return the two incomplete faces to be add new cut edges
    let [first, second] = deleteFaceV2(faces, edges, refLines)
    let [renderFirst, renderSecond] = deleteFaceV2(renderF, renderE, refLines)

    // snap cut on existing edges (refLines)
    let [new1, new2] = snapCut(edges, vertices, refLines, cut, 0)
    let [rnew1, rnew2] = snapCut(renderE, renderV, refLines, cut, offset)

    // add new faces
    addNewFacesV2(faces, edges, first, second, new1, new2)
    addNewFacesV2(renderF, renderE, renderFirst, renderSecond, rnew1, rnew2)
    
    setEdges(edges)
    setRenderE(renderE)
    setVertices(vertices)
    setRenderV(renderV)
    setFaces(faces)
    setCut([])
    setRefLines([])
  };

  const clear = () => {
    let v = getVertices(width, height, lt_x, lt_y, 0)
    let rv = getVertices(width, height, lt_x, lt_y, offset)
    let e = getEdges(v)
    let re = getEdges(rv)
    setVertices(v)
    setRenderV(rv)
    setEdges(e)
    setRenderE(re)
    setFaces(getFaces([0,1,2,3]))
    setRenderF(getFaces([0,1,2,3]))
    setCut([])
  }

  const trRef = useRef(null);
  const [selectedGrp,setSelectedGrp] = useState(null);
  

  useEffect(()=>{
    if (selectedGrp != null) {
      const transformNode = trRef.current;
      transformNode.nodes([selectedGrp.current])
    }

  },[selectedGrp,trRef])


  return (

    <div>
      <ModeBar 
          tool = {tool}
          setTool = {setTool}
          clear = {clear}
          pairFunction = {pairFunction}
          setPairFunction = {setPairFunction}
          width = {width}
          setWidth = {setWidth}
          height = {height}
          setHeight = {setHeight}
      />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {renderE.map((e, i) => {
            return (
            <Line
              key={i}
              points={getPoints(e)}
              stroke= {e.color}
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              onMouseOver={handleLineMouseOver}
              onMouseOut={handleLineMouseOut}
              onClick = {handleLineOnClick}
              onMouseDown={handleMouseDown}
              onMousemove={handleMouseMove}
              onMouseup={handleMouseUp}
            />)}
          )}

          {edges.map((e, i) => (
            <Line
              key={i}
              points={getPoints(e)}
              stroke= {"red"}
              strokeWidth={3}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              dash = {[20, 10]}
              opacity = {0.5}
            />)
          )}

          <Line
            points={cut}
            stroke= "yellow"
            strokeWidth={3}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />

          {renderF.map((f, i) => {
            return (
            <PolygonGroup 
              key = {i}
              id = {i}
              tool = {tool}
              face = {f}
              renderE = {renderE}
              width = {width}
              handleLineOnClick = {handleLineOnClick}
              setSelectedGrp = {setSelectedGrp}
              setMouseOverLine = {setMouseOverLine}
              lineSelected = {lineSelected}
              setLineSelected = {setLineSelected}
          />)})
          }

          <Transformer 
            rotationEnabled = {true}
            resizeEnabled = {false}
            ref = {trRef}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default CutOutCanvasV2;